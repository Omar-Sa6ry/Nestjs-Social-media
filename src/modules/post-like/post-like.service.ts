import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PostLike } from './entity/likesPost.entity '
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { RedisService } from 'src/common/redis/redis.service'
import { UserService } from '../users/users.service'
import {
  CreatePostLike,
  DeletePostLike,
  NoLikePost,
  NotAnyLikes,
  NotCreateLikePost,
  PostLikeExisted,
  PostNotFound,
  ZeroLikes,
} from 'src/common/constant/messages.constant'
import { Post } from '../post/entity/post.entity '
import { PaginationDto } from 'src/common/dtos/pagination.dto'

@Injectable()
export class PostLikeService {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
  ) {}

  async like (userId: number, id: number) {
    const post = await this.postRepository.findOne({ where: { id } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const postLike = await this.postLikeRepository.findOne({
      where: { userId, postId: id },
    })
    if (postLike) {
      throw new NotFoundException(PostLikeExisted)
    }

    const like = await this.postLikeRepository.create({
      userId,
      postId: post.id,
    })
    await this.postLikeRepository.save(like)
    return CreatePostLike
  }

  async unLike (userId: number, postId: number): Promise<string> {
    const post = await this.postLikeRepository.findOne({
      where: { postId, userId },
    })
    if (!post) {
      throw new BadRequestException(NoLikePost)
    }

    await this.postLikeRepository.remove(post)
    return DeletePostLike
  }

  async checkIfLike (userId: number, postId: number): Promise<boolean> {
    const postLikes = await this.postLikeRepository.find({
      where: { userId, postId },
    })
    if (postLikes.length === 0) {
      return false
    }
    return true
  }

  async userLikes (
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<Post[]> {
    const postLikes = await this.postLikeRepository.find({
      where: { userId },
    })
    if (postLikes.length === 0) {
      throw new BadRequestException(NotAnyLikes)
    }

    console.log(postLikes)


    let posts = []
    for (const post of postLikes) {
      const getPost = await this.postRepository.findOne({
        where: { id: post.postId },
      })
      posts.push(getPost)
    }

    
    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        posts = posts.slice(offset || 0, limit + (offset || 0))
      }
    }
    return posts
  }

  async numPostLikes (postId: number): Promise<number> {
    const postLikes = await this.postLikeRepository.find({
      where: { postId },
    })
    if (postLikes.length === 0) {
      throw new BadRequestException(ZeroLikes)
    }

    return postLikes.length
  }
}
