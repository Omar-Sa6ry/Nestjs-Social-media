import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserService } from '../users/users.service'
import { User } from '../users/entity/user.entity'
import { CommentMention } from './entity/comment.mention.entity '
import { CommentMentionResponse } from './dto/mentionCommentResponse.dto'
import { Comment } from '../comment/entity/comment.entity '
import {
  CommentNotFound,
  DeleteMention,
  MentionExisted,
  MentionPostFound,
  NoMentionForPost,
  NoMentionForYou,
  PostNotFound,
  UserMentionNotFound,
} from 'src/common/constant/messages.constant'

@Injectable()
export class CommentMentionService {
  constructor (
    private usersService: UserService,
    @InjectRepository(CommentMention)
    private commentMentionRepository: Repository<CommentMention>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create (
    userId: number,
    userName: string,
    commentId: number,
  ): Promise<CommentMentionResponse> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const existedMention = await this.commentMentionRepository.findOne({
      where: { userId, to: mentionedUser.id, commentId },
    })
    if (existedMention) {
      throw new BadRequestException(MentionExisted)
    }

    const mention = await this.commentMentionRepository.create({
      to: mentionedUser.id,
      commentId,
      userId,
    })
    await this.commentMentionRepository.save(mention)

    const result = {
      id: mention.id,
      username: user.userName,
      mentionTo: mentionedUser.id,
      comment,
      createdAt: mention.createdAt,
    }
    return result
  }

  async get (
    userId: number,
    userName: string,
    commentId: number,
  ): Promise<CommentMentionResponse> {
    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mention = await this.commentMentionRepository.findOne({
      where: { to: mentionedUser.id, commentId, userId },
    })

    if (!mention) {
      throw new NotFoundException(MentionPostFound)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const result = {
      id: mention.id,
      username: user.userName,
      mentionTo: mentionedUser.id,
      comment,
      createdAt: mention.createdAt,
    }
    return result
  }

  async getTo (userId: number): Promise<CommentMentionResponse[]> {
    const mentions = await this.commentMentionRepository.find({
      where: { to: userId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForYou)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const result = []
    for (const mention of mentions) {
      const comment = await this.commentRepository.findOne({
        where: { id: mention.commentId },
      })
      if (!comment) {
        throw new NotFoundException(PostNotFound)
      }

      result.push({
        id: mention.id,
        username: user.userName,
        mentionTo: mention.to,
        comment,
        createdAt: mention.createdAt,
      })
    }
    return result
  }

  async getFrom (userId: number): Promise<CommentMentionResponse[]> {
    const mentions = await this.commentMentionRepository.find({
      where: { userId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForYou)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const result = []
    for (const mention of mentions) {
      const comment = await this.commentRepository.findOne({
        where: { id: mention.commentId },
      })
      if (!comment) {
        throw new NotFoundException(PostNotFound)
      }

      result.push({
        id: mention.id,
        username: user.userName,
        mentionTo: mention.to,
        comment,
        createdAt: mention.createdAt,
      })
    }
    return result
  }

  async getComment (commentId: number): Promise<CommentMentionResponse[]> {
    const mentions = await this.commentMentionRepository.find({
      where: { commentId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForPost)
    }

    const result = []
    for (const mention of mentions) {
      const comment = await this.commentRepository.findOne({
        where: { id: mention.commentId },
      })
      if (!comment) {
        throw new NotFoundException(PostNotFound)
      }

      result.push({
        id: mention.id,
        username: mention.userId,
        mentionTo: mention.to,
        comment,
        createdAt: mention.createdAt,
      })
    }
    return result
  }

  async isMention (commentId: number, userName: string): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })
    if (!comment) {
      throw new NotFoundException(PostNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }
    const mention = await this.commentMentionRepository.findOne({
      where: { commentId, to: mentionedUser.id },
    })
    return !!mention
  }

  async delete (
    userId: number,
    userName: string,
    commentId: number,
  ): Promise<string> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }
    const mention = await this.commentMentionRepository.findOne({
      where: { to: mentionedUser.id, commentId, userId },
    })

    if (!mention) {
      throw new NotFoundException(MentionPostFound)
    }

    await this.commentMentionRepository.remove(mention)
    return DeleteMention
  }
}
