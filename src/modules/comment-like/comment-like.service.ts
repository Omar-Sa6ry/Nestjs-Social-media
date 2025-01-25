import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { CommentLike } from './entity/likesComment.entity '
import { Comment } from '../comment/entity/comment.entity '
import {
  CommentNotFound,
  CreateCommentLike,
  DeleteCommentLike,
  NoLikeComment,
  NotAnyLikes,
  CommentLikeExisted,
  ZeroLikes,
} from 'src/common/constant/messages.constant'

@Injectable()
export class CommentLikeService {
  constructor (
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  async like (userId: number, id: number): Promise<string> {
    const comment = await this.commentRepository.findOne({ where: { id } })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const commentLike = await this.commentLikeRepository.findOne({
      where: { userId, commentId: id },
    })
    if (commentLike) {
      throw new NotFoundException(CommentLikeExisted)
    }

    const like = await this.commentLikeRepository.create({
      userId,
      commentId: comment.id,
    })
    await this.commentLikeRepository.save(like)
    return CreateCommentLike
  }

  async unLike (userId: number, commentId: number): Promise<string> {
    const comment = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    })
    if (!comment) {
      throw new BadRequestException(NoLikeComment)
    }

    await this.commentLikeRepository.remove(comment)
    return DeleteCommentLike
  }

  async checkIfLike (userId: number, commentId: number): Promise<boolean> {
    const commentLikes = await this.commentLikeRepository.find({
      where: { userId, commentId },
    })
    if (commentLikes.length === 0) {
      return false
    }
    return true
  }

  async userLikes (
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<Comment[]> {
    const commentLikes = await this.commentLikeRepository.find({
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
    const commentLikes = await this.commentLikeRepository.find({
      where: { commentId },
    })
    if (commentLikes.length === 0) {
      throw new BadRequestException(ZeroLikes)
    }

    return commentLikes.length
  }
}
