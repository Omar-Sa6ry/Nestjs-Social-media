import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PostLike } from './entity/likesPost.entity '
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  CreatePostLike,
  DeletePostLike,
  NoLikePost,
  NotAnyLikes,
  PostLikeExisted,
  PostNotFound,
  UserNameIsWrong,
  ZeroLikes,
} from 'src/common/constant/messages.constant'
import { Post } from '../post/entity/post.entity '
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { User } from '../users/entity/user.entity'
import { Comment } from '../comment/entity/comment.entity '
import { PostResponse } from '../post/dto/postResponse.dto'

@Injectable()
export class PostLikeService {
  constructor (
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async like (userId: number, id: number): Promise<string> {
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
  ): Promise<PostResponse[]> {
    const postLikes = await this.postLikeRepository.find({
      where: { userId },
    })
    if (postLikes.length === 0) {
      throw new BadRequestException(NotAnyLikes)
    }

    let result = []
    for (const postlike of postLikes) {
      const post = await this.postRepository.findOne({
        where: { id: postlike.userId },
      })
      if (!post) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const user = await this.userRepository.findOne({
        where: { id: post.userId },
      })
      if (!user) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const comments = await this.commentRepository.find({
        where: { id: post.userId },
      })

      const likes = await this.numPostLikes(post.id)

      result.push({
        id: post.id,
        content: post.content,
        user,
        comments,
        likes,
        createdAt: post.createdAt,
      })
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        result = result.slice(offset || 0, limit + (offset || 0))
      }
    }
    return result
  }

  async numPostLikes (postId: number): Promise<number> {
    const postLikes = await this.postLikeRepository.find({
      where: { postId },
    })
    if (postLikes.length === 0) {
      return 0
    }

    return postLikes.length
  }
}
