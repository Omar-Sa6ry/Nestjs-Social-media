import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Like } from './entity/like.entity '
import { Repository } from 'typeorm'
import { Post } from '../post/entity/post.entity '
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { User } from '../users/entity/user.entity'
import { Comment } from '../comment/entity/comment.entity '
import { PostResponse } from '../post/dto/PostResponse.dto'
import { InjectRepository } from '@nestjs/typeorm'
import {
  CommentLikeExisted,
  CommentNotFound,
  CreateCommentLike,
  CreatePostLike,
  DeleteCommentLike,
  DeletePostLike,
  NoLikeComment,
  NoLikePost,
  NotAnyLikes,
  PostLikeExisted,
  PostNotFound,
  UserNameIsWrong,
  ZeroLikes,
} from 'src/common/constant/messages.constant'

@Injectable()
export class LikeService {
  constructor (
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  // --------------Post-----------

  async likePost (userId: number, id: number): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const postLike = await this.likeRepository.findOne({
      where: { userId, postId: id },
    })
    if (postLike) {
      throw new NotFoundException(PostLikeExisted)
    }

    const like = await this.likeRepository.create({
      userId,
      postId: post.id,
    })
    await this.likeRepository.save(like)
    return CreatePostLike
  }

  async unLikePost (userId: number, postId: number): Promise<string> {
    const post = await this.likeRepository.findOne({
      where: { postId, userId },
    })
    if (!post) {
      throw new BadRequestException(NoLikePost)
    }

    await this.likeRepository.remove(post)
    return DeletePostLike
  }

  async checkIfPostLike (userId: number, postId: number): Promise<boolean> {
    const postLikes = await this.likeRepository.find({
      where: { userId, postId },
    })
    if (postLikes.length === 0) {
      return false
    }
    return true
  }

  async userPostLikes (
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<PostResponse[]> {
    const postLikes = await this.likeRepository.find({
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
    const postLikes = await this.likeRepository.find({
      where: { postId },
    })
    if (postLikes.length === 0) {
      return 0
    }

    return postLikes.length
  }

  // -------------Comment-------

  async likeCommnt (userId: number, id: number): Promise<string> {
    const comment = await this.commentRepository.findOne({ where: { id } })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const commentLike = await this.likeRepository.findOne({
      where: { userId, commentId: id },
    })
    if (commentLike) {
      throw new NotFoundException(CommentLikeExisted)
    }

    const like = await this.likeRepository.create({
      userId,
      commentId: comment.id,
    })
    await this.likeRepository.save(like)
    return CreateCommentLike
  }

  async unLikeComment (userId: number, commentId: number): Promise<string> {
    const comment = await this.likeRepository.findOne({
      where: { commentId, userId },
    })
    if (!comment) {
      throw new BadRequestException(NoLikeComment)
    }

    await this.likeRepository.remove(comment)
    return DeleteCommentLike
  }

  async checkIfCommentLike (
    userId: number,
    commentId: number,
  ): Promise<boolean> {
    const commentLikes = await this.likeRepository.find({
      where: { userId, commentId },
    })
    if (commentLikes.length === 0) {
      return false
    }
    return true
  }

  async userCommentLikes (
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<Comment[]> {
    const commentLikes = await this.likeRepository.find({
      where: { userId },
    })
    if (commentLikes.length === 0) {
      throw new BadRequestException(NotAnyLikes)
    }

    let comments = []
    for (const comment of commentLikes) {
      const getComment = await this.commentRepository.findOne({
        where: { id: comment.commentId },
      })
      comments.push(getComment)
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        comments = comments.slice(offset || 0, limit + (offset || 0))
      }
    }
    return comments
  }

  async numCommentLikes (commentId: number): Promise<number> {
    const commentLikes = await this.likeRepository.find({
      where: { commentId },
    })
    if (commentLikes.length === 0) {
      throw new BadRequestException(ZeroLikes)
    }

    return commentLikes.length
  }
}
