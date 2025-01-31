import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Post } from './entity/post.entity '
import { UploadService } from '../upload/upload.service'
import { LikeService } from '../like/like.service'
import { User } from '../users/entity/user.entity'
import { PostResponse } from './dto/PostResponse.dto'
import { Comment } from '../comment/entity/comment.entity '
import { Repository } from 'typeorm'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import {
  DeletePost,
  EnterContentOrImage,
  ImageLength,
  NoPosts,
  NotPostYou,
  PostNotFound,
  PostsNotFound,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'

@Injectable()
export class PostService {
  constructor (
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    private readonly likeService: LikeService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async create (
    userId: number,
    content: string,
    createImageDto: CreateImagDto[],
  ): Promise<PostResponse> {
    if (!content && createImageDto.length === 0) {
      throw new BadRequestException(EnterContentOrImage)
    }

    if (createImageDto.length > 5) {
      throw new BadRequestException(ImageLength)
    }

    const post = await this.postRepository.create({ content, userId })
    await this.postRepository.save(post)

    if (createImageDto.length !== 0) {
      const images = await this.uploadService.uploadImages(
        createImageDto,
        post.id,
      )
    }

    const relationCacheKey = `post:${post.id}`
    await this.redisService.set(relationCacheKey, post)

    const user = await this.userRepository.findOne({
      where: { id: post.userId },
    })
    if (!user) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const result = {
      id: post.id,
      content: post.content,
      user,
      comments: null,
      likes: 0,
      createdAt: post.createdAt,
    }

    this.websocketGateway.broadcast('postCreated', {
      postId: post.id,
      content: post.content,
      userId,
    })

    return result
  }

  async getId (id: number): Promise<PostResponse> {
    const post = await this.postRepository.findOne({
      where: { id },
    })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const relationCacheKey = `posts:${id}`
    await this.redisService.set(relationCacheKey, post)

    const user = await this.userRepository.findOne({
      where: { id: post.userId },
    })
    if (!user) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const comments = await this.commentRepository.find({
      where: { id: post.userId },
    })

    const likes = await this.likeService.numPostLikes(post.id)

    const result = {
      id: post.id,
      content: post.content,
      user,
      comments,
      likes,
      createdAt: post.createdAt,
    }

    return result
  }

  async getContent (
    content: string,
    paginationDto?: PaginationDto,
  ): Promise<PostResponse[]> {
    let posts = await this.postRepository.find({
      order: { createdAt: 'DESC' },
    })
    posts.filter(post => post.content.includes(content))

    if (posts.length === 0) {
      throw new NotFoundException(PostsNotFound)
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        posts = posts.slice(offset || 0, limit + (offset || 0))
      }
    }

    const result = []
    for (const post of posts) {
      const user = await this.userRepository.findOne({
        where: { id: post.userId },
      })
      if (!user) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const comments = await this.commentRepository.find({
        where: { id: post.userId },
      })

      const likes = await this.likeService.numPostLikes(post.id)

      result.push({
        id: post.id,
        content: post.content,
        user,
        comments,
        likes,
        createdAt: post.createdAt,
      })
    }
    return result
  }

  async userPosts (userId: number): Promise<PostResponse[]> {
    const posts = await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    })

    if (posts.length === 0) {
      throw new NotFoundException(NoPosts)
    }

    const relationCacheKey = `posts:${userId}`
    await this.redisService.set(relationCacheKey, posts)

    const result = []
    for (const post of posts) {
      const user = await this.userRepository.findOne({
        where: { id: post.userId },
      })
      if (!user) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const comments = await this.commentRepository.find({
        where: { id: post.userId },
      })

      const likes = await this.likeService.numPostLikes(post.id)

      result.push({
        id: post.id,
        content: post.content,
        user,
        comments,
        likes,
        createdAt: post.createdAt,
      })
    }
    return result
  }

  async update (
    userId: number,
    id: number,
    content: string,
  ): Promise<PostResponse> {
    if (!content) {
      throw new BadRequestException(EnterContentOrImage)
    }

    const post = await this.postRepository.findOne({ where: { id, userId } })
    if (content) {
      post.content = content
    }
    await this.postRepository.save(post)
    const relationCacheKey = `post:${post.id}`
    await this.redisService.set(relationCacheKey, post)

    const user = await this.userRepository.findOne({
      where: { id: post.userId },
    })
    if (!user) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const comments = await this.commentRepository.find({
      where: { id: post.userId },
    })

    const likes = await this.likeService.numPostLikes(post.id)

    this.websocketGateway.broadcast('postUpdated', {
      postId: id,
      userId,
    })

    const result = {
      id: post.id,
      content: post.content,
      user,
      comments,
      likes,
      createdAt: post.createdAt,
    }

    return result
  }

  async delete (userId: number, id: number): Promise<string> {
    const post = await this.postRepository.findOne({
      where: { id },
    })
    if (!post) {
      throw new BadRequestException(NoPosts)
    }
    if (userId !== post.userId) {
      throw new BadRequestException(NotPostYou)
    }
    await this.postRepository.remove(post)

    this.websocketGateway.broadcast('postDeleted', {
      postId: id,
      userId,
    })

    return DeletePost
  }
}
