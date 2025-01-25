import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Post } from '../post/entity/post.entity '
import { PostMention } from './entity/mentionPost.entity '
import { RedisService } from 'src/common/redis/redis.service'
import { UserService } from '../users/users.service'
import {
  DeleteMention,
  MentionExisted,
  MentionPostFound,
  NoMentionForPost,
  NoMentionForYou,
  PostNotFound,
  UserMentionNotFound,
} from 'src/common/constant/messages.constant'
import { User } from '../users/entity/user.entity'
import { PostMentionResponse } from './dto/mentionPostResponse.dto'

@Injectable()
export class PostMentionService {
  constructor (
    private usersService: UserService,
    @InjectRepository(PostMention)
    private postMentionRepository: Repository<PostMention>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create (
    userId: number,
    userName: string,
    postId: number,
  ): Promise<PostMentionResponse> {
    const post = await this.postRepository.findOne({ where: { id: postId } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const existedMention = await this.postMentionRepository.findOne({
      where: { userId, to: mentionedUser.id, postId },
    })
    if (existedMention) {
      throw new BadRequestException(MentionExisted)
    }

    const mention = await this.postMentionRepository.create({
      to: mentionedUser.id,
      postId,
      userId,
    })
    await this.postMentionRepository.save(mention)

    const result = {
      id: mention.id,
      username: user.userName,
      mentionTo: mentionedUser.id,
      post: post,
      createdAt: mention.createdAt,
    }
    return result
  }

  async get (
    userId: number,
    userName: string,
    postId: number,
  ): Promise<PostMentionResponse> {
    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mention = await this.postMentionRepository.findOne({
      where: { to: mentionedUser.id, postId, userId },
    })

    if (!mention) {
      throw new NotFoundException(MentionPostFound)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const post = await this.postRepository.findOne({ where: { id: postId } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const result = {
      id: mention.id,
      username: user.userName,
      mentionTo: mentionedUser.id,
      post: post,
      createdAt: mention.createdAt,
    }
    return result
  }

  async getTo (userId: number): Promise<PostMentionResponse[]> {
    const mentions = await this.postMentionRepository.find({
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
      const post = await this.postRepository.findOne({
        where: { id: mention.postId },
      })
      if (!post) {
        throw new NotFoundException(PostNotFound)
      }

      result.push({
        id: mention.id,
        username: user.userName,
        mentionTo: mention.to,
        post: post,
        createdAt: mention.createdAt,
      })
    }
    return result
  }

  async getFrom (userId: number): Promise<PostMentionResponse[]> {
    const mentions = await this.postMentionRepository.find({
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
      const post = await this.postRepository.findOne({
        where: { id: mention.postId },
      })
      if (!post) {
        throw new NotFoundException(PostNotFound)
      }

      result.push({
        id: mention.id,
        username: user.userName,
        mentionTo: mention.to,
        post: post,
        createdAt: mention.createdAt,
      })
    }
    return result
  }

  async getPost (postId: number): Promise<PostMentionResponse[]> {
    const mentions = await this.postMentionRepository.find({
      where: { postId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForPost)
    }

    const result = []
    for (const mention of mentions) {
      const post = await this.postRepository.findOne({
        where: { id: mention.postId },
      })
      if (!post) {
        throw new NotFoundException(PostNotFound)
      }

      result.push({
        id: mention.id,
        username: mention.userId,
        mentionTo: mention.to,
        post: post,
        createdAt: mention.createdAt,
      })
    }
    return result
  }

  async isMention (postId: number, userName: string): Promise<boolean> {
    const post = await this.postRepository.findOne({ where: { id: postId } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }
    const mention = await this.postMentionRepository.findOne({
      where: { postId, to: mentionedUser.id },
    })
    return !!mention
  }

  async delete (
    userId: number,
    userName: string,
    postId: number,
  ): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id: postId } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }
    const mention = await this.postMentionRepository.findOne({
      where: { to: mentionedUser.id, postId, userId },
    })

    if (!mention) {
      throw new NotFoundException(MentionPostFound)
    }

    await this.postMentionRepository.remove(mention)
    return DeleteMention
  }
}
