import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import DataLoader from 'dataloader'
import { CommentMentionResponse } from './dtos/MentionCommentResponse.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entity/user.entity'
import { Mention } from './entity/mention.entity '
import { PostMentionResponse } from './dtos/MentionPostResponse.dto'
import { Post } from '../post/entity/post.entity '
import { UserService } from '../users/users.service'
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
import {
  createCommentMentionLoader,
  createPostMentionLoader,
} from 'src/common/loaders/date-loaders'

@Injectable()
export class MentionService {
  private postMentionLoader: DataLoader<
    { userId: number; mentionTo: number; postId: number },
    any
  >
  private commentMentionLoader: DataLoader<
    { userId: number; mentionTo: number; commentId: number },
    any
  >

  constructor (
    private usersService: UserService,
    @InjectRepository(Mention)
    private mentionRepository: Repository<Mention>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {
    ;(this.postMentionLoader = createPostMentionLoader(
      this.userRepository,
      this.postRepository,
      this.mentionRepository,
    )),
      (this.commentMentionLoader = createCommentMentionLoader(
        this.userRepository,
        this.commentRepository,
        this.mentionRepository,
      ))
  }

  // ---------------- Post -------------------------

  async createPostMention (
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

    const existedMention = await this.mentionRepository.findOne({
      where: { userId, to: mentionedUser.id, postId },
    })
    if (existedMention) {
      throw new BadRequestException(MentionExisted)
    }

    const mention = await this.mentionRepository.create({
      to: mentionedUser.id,
      postId,
      userId,
    })
    await this.mentionRepository.save(mention)

    const result = {
      id: mention.id,
      mentionFrom: user,
      mentionTo: mentionedUser,
      post: post,
      createdAt: mention.createdAt,
    }
    return result
  }

  async getPostMention (
    userId: number,
    userName: string,
    postId: number,
  ): Promise<PostMentionResponse> {
    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mention = await this.mentionRepository.findOne({
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
      mentionFrom: user,
      mentionTo: mentionedUser,
      post: post,
      createdAt: mention.createdAt,
    }
    return result
  }

  async getToPost (userId: number): Promise<PostMentionResponse[]> {
    const mentions = await this.mentionRepository.find({
      where: { to: userId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForYou)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mentionKeys = mentions.map(mention => ({
      userId,
      mentionTo: mention.to,
      postId: mention.postId,
    }))

    return this.postMentionLoader.loadMany(mentionKeys)
  }

  async getFromPost (userId: number): Promise<PostMentionResponse[]> {
    const mentions = await this.mentionRepository.find({
      where: { userId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForYou)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mentionKeys = mentions.map(mention => ({
      userId: mention.userId,
      mentionTo: mention.to,
      postId: mention.postId,
    }))

    return this.postMentionLoader.loadMany(mentionKeys)
  }

  async getPost (postId: number): Promise<PostMentionResponse[]> {
    const mentions = await this.mentionRepository.find({
      where: { postId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForPost)
    }

    const mentionKeys = mentions.map(mention => ({
      userId: mention.userId,
      mentionTo: mention.to,
      postId: mention.postId,
    }))

    return this.postMentionLoader.loadMany(mentionKeys)
  }

  async isPostMention (postId: number, userName: string): Promise<boolean> {
    const post = await this.postRepository.findOne({ where: { id: postId } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }
    const mention = await this.mentionRepository.findOne({
      where: { postId, to: mentionedUser.id },
    })
    return !!mention
  }

  async deletePostMention (
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
    const mention = await this.mentionRepository.findOne({
      where: { to: mentionedUser.id, postId, userId },
    })

    if (!mention) {
      throw new NotFoundException(MentionPostFound)
    }

    await this.mentionRepository.remove(mention)
    return DeleteMention
  }

  // --------------------------Comment--------------------------

  async createCommentMention (
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

    const existedMention = await this.mentionRepository.findOne({
      where: { userId, to: mentionedUser.id, commentId },
    })
    if (existedMention) {
      throw new BadRequestException(MentionExisted)
    }

    const mention = await this.mentionRepository.create({
      to: mentionedUser.id,
      commentId,
      userId,
    })
    await this.mentionRepository.save(mention)

    const result = {
      id: mention.id,
      username: user.userName,
      mentionTo: mentionedUser.id,
      comment,
      createdAt: mention.createdAt,
    }
    return result
  }

  async getMentionComment (
    userId: number,
    userName: string,
    commentId: number,
  ): Promise<CommentMentionResponse> {
    const mentionedUser = await this.usersService.findByUserName(userName)
    if (!(mentionedUser instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mention = await this.mentionRepository.findOne({
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

  async getToComment (userId: number): Promise<CommentMentionResponse[]> {
    const mentions = await this.mentionRepository.find({
      where: { to: userId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForYou)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mentionKeys = mentions.map(mention => ({
      userId: mention.userId,
      mentionTo: mention.to,
      commentId: mention.commentId,
    }))

    return this.commentMentionLoader.loadMany(mentionKeys)
  }

  async getFromComment (userId: number): Promise<CommentMentionResponse[]> {
    const mentions = await this.mentionRepository.find({
      where: { userId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForYou)
    }

    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserMentionNotFound)
    }

    const mentionKeys = mentions.map(mention => ({
      userId: mention.userId,
      mentionTo: mention.to,
      commentId: mention.commentId,
    }))

    return this.commentMentionLoader.loadMany(mentionKeys)
  }

  async getComment (commentId: number): Promise<CommentMentionResponse[]> {
    const mentions = await this.mentionRepository.find({
      where: { commentId },
    })

    if (mentions.length === 0) {
      throw new NotFoundException(NoMentionForPost)
    }

    const mentionKeys = mentions.map(mention => ({
      userId: mention.userId,
      mentionTo: mention.to,
      commentId: mention.commentId,
    }))

    return this.commentMentionLoader.loadMany(mentionKeys)
  }

  async isCommentMention (
    commentId: number,
    userName: string,
  ): Promise<boolean> {
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
    const mention = await this.mentionRepository.findOne({
      where: { commentId, to: mentionedUser.id },
    })
    return !!mention
  }

  async deleteCommentMention (
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
    const mention = await this.mentionRepository.findOne({
      where: { to: mentionedUser.id, commentId, userId },
    })

    if (!mention) {
      throw new NotFoundException(MentionPostFound)
    }

    await this.mentionRepository.remove(mention)
    return DeleteMention
  }
}
