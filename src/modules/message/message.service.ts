import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UserService } from '../users/users.service'
import { User } from '../users/entity/user.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { messageInput } from './dto/message.input'
import { Message } from './entity/message.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateMessageDto } from './dto/CreateMessage.dto'
import {
  DeleteMessage,
  MessageRead,
  NoMessages,
  NoMessagesSend,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'

@Injectable()
export class MessageService {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async send (
    senderId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<messageInput> {
    const { content, userName } = createMessageDto
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const message = await this.messageRepository.create({
      content,
      senderId,
      receiverId: user.id,
    })
    await this.messageRepository.save(message)

    const sender = await this.usersService.findById(senderId)
    if (!(sender instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const result = {
      id: message.id,
      content: message.content,
      Isread: message.Isread,
      createdAt: message.createdAt,
      sender,
      receive: user,
    }

    const relationCacheKey = `message:${senderId}:${user.id}`
    await this.redisService.set(relationCacheKey, result)

    await this.websocketGateway.sendMessageToUser(
      user.id.toString(),
      'newMessage',
      result,
    )
    return result
  }

  async chat (userId: number, userName: string): Promise<messageInput[]> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const messages = await this.messageRepository.find({
      where: [
        { receiverId: userId, senderId: user.id },
        { senderId: userId, receiverId: user.id },
      ],
      order: { createdAt: 'ASC' },
    })

    if (messages.length === 0) {
      throw new NotFoundException(NoMessages)
    }

    const result = []
    for (const message of messages) {
      const sender = await this.usersService.findById(message.senderId)
      if (!(sender instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const user = await this.usersService.findById(message.receiverId)
      if (!(user instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      result.push({
        id: message.id,
        content: message.content,
        Isread: message.Isread,
        createdAt: message.createdAt,
        sender,
        receive: user,
      })
    }

    const relationCacheKey = `message:${userId}:${user.id}`
    await this.redisService.set(relationCacheKey, result)
    return result
  }

  async userMessages (userId: number): Promise<messageInput[]> {
    const messages = await this.messageRepository.find({
      where: [{ receiverId: userId }, { senderId: userId }],
      order: { createdAt: 'ASC' },
    })

    if (messages.length === 0) {
      throw new NotFoundException(NoMessagesSend)
    }

    const result = []
    for (const message of messages) {
      const sender = await this.usersService.findById(message.senderId)
      if (!(sender instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const user = await this.usersService.findById(message.receiverId)
      if (!(user instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      result.push({
        id: message.id,
        content: message.content,
        Isread: message.Isread,
        createdAt: message.createdAt,
        sender,
        receive: user,
      })

      const relationCacheKey = `message:${userId}`
      await this.redisService.set(relationCacheKey, messages)
      return result
    }
  }

  async markMessageRead (senderId: number, userName: string): Promise<string> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const messages = await this.messageRepository.find({
      where: { senderId, receiverId: user.id, Isread: false },
    })

    for (const message of messages) {
      message.Isread = true
    }
    await this.messageRepository.save(messages)
    return MessageRead
  }

  async gotNotRead (
    senderId: number,
    receiverId: number,
  ): Promise<messageInput[]> {
    const messages = await this.messageRepository.find({
      where: { receiverId, senderId, Isread: false },
    })

    const result = []
    for (const message of messages) {
      const sender = await this.usersService.findById(message.senderId)
      if (!(sender instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const user = await this.usersService.findById(message.receiverId)
      if (!(user instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      result.push({
        id: message.id,
        content: message.content,
        Isread: message.Isread,
        createdAt: message.createdAt,
        sender,
        receive: user,
      })
      return result
    }
  }

  async deleteMessage (senderId: number, id: number): Promise<string> {
    const message = await this.messageRepository.findOne({
      where: { senderId, id },
    })
    if (!message) {
      throw new BadRequestException(NoMessages)
    }
    await this.messageRepository.remove(message)
    return DeleteMessage
  }
}
