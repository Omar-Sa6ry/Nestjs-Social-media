import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '../users/entity/user.entity'
import { ReplyResponse } from './dto/replyResponse.dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Repository } from 'typeorm'
import { Reply } from './entity/reply.entity '
import { Comment } from '../comment/entity/comment.entity '
import { InjectRepository } from '@nestjs/typeorm'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import {
  CommentNotFound,
  CommentsNotFound,
  DeleteComment,
  UpdateComment,
} from 'src/common/constant/messages.constant'

@Injectable()
export class ReplyService {
  constructor (
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async write (
    userId: number,
    commentId: number,
    content: string,
  ): Promise<ReplyResponse> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const reply = await this.replyRepository.create({
      userId,
      content,
      commentId,
    })
    await this.replyRepository.save(reply)

    const user = await this.userRepository.findOne({
      where: { id: comment.userId },
    })

    const result = {
      id: comment.id,
      content,
      comment,
      user,
      createdAt: comment.createdAt,
    }

    await this.websocketGateway.broadcast('replyWrite', {
      reply: reply.id,
      userId,
    })

    return result
  }

  async get (
    userId: number,
    commentId: number,
    content: string,
  ): Promise<ReplyResponse> {
    const reply = await this.replyRepository.findOne({
      where: {
        userId,
        content,
        commentId,
      },
    })

    if (!reply) {
      throw new BadRequestException(CommentNotFound)
    }

    const comment = await this.commentRepository.findOne({
      where: { id: reply.commentId },
    })
    const user = await this.userRepository.findOne({
      where: { id: reply.userId },
    })

    const result = {
      id: comment.id,
      content,
      comment,
      user,
      createdAt: comment.createdAt,
    }
    return result
  }

  async getCommentPost (commentId: number): Promise<ReplyResponse[]> {
    const replys = await this.replyRepository.find({
      where: {
        commentId,
      },
    })

    if (replys.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    const result = []
    for (const reply of replys) {
      const comment = await this.commentRepository.findOne({
        where: { id: reply.commentId },
      })
      const user = await this.userRepository.findOne({
        where: { id: reply.userId },
      })

      result.push({
        id: reply.id,
        content: reply.content,
        comment,
        user,
        createdAt: reply.createdAt,
      })
    }
    return result
  }

  async getCountCommentPost (commentId: number): Promise<number> {
    const replys = await this.replyRepository.find({
      where: {
        commentId,
      },
    })

    if (replys.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }
    return replys.length
  }

  async getCommentUser (userId: number): Promise<ReplyResponse[]> {
    const replys = await this.replyRepository.find({
      where: {
        userId,
      },
    })

    if (replys.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    const result = []
    for (const reply of replys) {
      const comment = await this.commentRepository.findOne({
        where: { id: reply.commentId },
      })
      const user = await this.userRepository.findOne({
        where: { id: reply.userId },
      })

      result.push({
        id: comment.id,
        content: comment.content,
        comment,
        user,
        createdAt: comment.createdAt,
      })
    }
    return result
  }

  async getLastComment (
    userId: number,
    commentId: number,
    paginationDto?: PaginationDto,
  ): Promise<ReplyResponse[]> {
    let replys = await this.replyRepository.find({
      where: {
        userId,
        commentId,
      },
    })

    if (replys.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        replys = replys.slice(offset || 0, limit + (offset || 0))
      }
    }

    const result = []
    for (const reply of replys) {
      const comment = await this.commentRepository.findOne({
        where: { id: reply.commentId },
      })
      const user = await this.userRepository.findOne({
        where: { id: reply.userId },
      })

      result.push({
        id: reply.id,
        content: reply.content,
        comment,
        user,
        createdAt: reply.createdAt,
      })
    }
    return result
  }

  async getUserByComment (id: number): Promise<User> {
    const reply = await this.replyRepository.findOne({ where: { id } })
    if (!reply) {
      throw new BadRequestException(CommentNotFound)
    }

    return await this.userRepository.findOne({ where: { id: reply.userId } })
  }

  async update (userId: number, id: number, content: string): Promise<string> {
    const reply = await this.replyRepository.findOne({
      where: { id, userId },
    })
    if (!reply) {
      throw new BadRequestException(CommentNotFound)
    }

    reply.content = content
    await this.replyRepository.save(reply)

    this.websocketGateway.broadcast('replyUpdate', {
      reply: reply.id,
      userId,
    })

    return UpdateComment
  }

  async delete (userId: number, id: number): Promise<string> {
    const reply = await this.replyRepository.findOne({
      where: { id, userId },
    })
    if (!reply) {
      throw new BadRequestException(CommentNotFound)
    }

    const comment = await this.replyRepository.findOne({
      where: { commentId: reply.commentId },
    })
    if (!comment) {
      throw new BadRequestException(CommentNotFound)
    }

    await this.replyRepository.remove(reply)

    this.websocketGateway.broadcast('replyDeleted', {
      reply: reply.id,
      userId,
    })

    return DeleteComment
  }
}
