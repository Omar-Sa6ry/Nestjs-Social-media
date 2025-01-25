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
import { Repository } from 'typeorm'
import { RedisService } from 'src/common/redis/redis.service'
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
import { User } from '../users/entity/user.entity'
import { PostResponse } from './dto/postResponse.dto'
import { Comment } from '../comment/entity/comment.entity '
import { PostLikeService } from '../post-like/post-like.service'

@Injectable()
export class PostService {
  constructor (
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    private readonly postLikeService: PostLikeService,
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
      console.log(images)
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

    const likes = await this.postLikeService.numPostLikes(post.id)

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

      const likes = await this.postLikeService.numPostLikes(post.id)

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

      const likes = await this.postLikeService.numPostLikes(post.id)

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

    const likes = await this.postLikeService.numPostLikes(post.id)

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
    return DeletePost
  }
}
