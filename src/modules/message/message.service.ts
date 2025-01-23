import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UserService } from '../users/users.service'
import { User } from '../users/entity/user.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { Message } from './entity/message.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateMessageDto } from './dto/createMessage.dto'
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
    @InjectRepository(Message)
    private MessageRepository: Repository<Message>,
  ) {}

  async send (
    senderId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const { content, userName } = createMessageDto
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const message = await this.MessageRepository.create({
      content,
      senderId,
      receiverId: user.id,
    })
    await this.MessageRepository.save(message)

    const relationCacheKey = `message:${senderId}:${user.id}`
    await this.redisService.set(relationCacheKey, message)
    return message
  }

  async chat (userId: number, userName: string): Promise<Message[]> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const message = await this.MessageRepository.find({
      where: [
        { receiverId: userId, senderId: user.id },
        { senderId: userId, receiverId: user.id },
      ],
      order: { createdAt: 'ASC' },
    })

    if (message.length === 0) {
      throw new NotFoundException(NoMessages)
    }

    const relationCacheKey = `message:${userId}:${user.id}`
    await this.redisService.set(relationCacheKey, message)
    return message
  }

  async userMessages (userId: number): Promise<Message[]> {
    const messages = await this.MessageRepository.find({
      where: [{ receiverId: userId }, { senderId: userId }],
      order: { createdAt: 'ASC' },
    })

    if (messages.length === 0) {
      throw new NotFoundException(NoMessagesSend)
    }

    const relationCacheKey = `message:${userId}`
    await this.redisService.set(relationCacheKey, messages)
    return messages
  }

  async markMessageRead (senderId: number, userName: string): Promise<string> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const messages = await this.MessageRepository.find({
      where: { senderId, receiverId: user.id, Isread: false },
    })

    for (const message of messages) {
      message.Isread = true
    }
    await this.MessageRepository.save(messages)
    return MessageRead
  }

  async gotNotRead (senderId: number, receiverId: number): Promise<Message[]> {
    const messages = await this.MessageRepository.find({
      where: { receiverId, senderId, Isread: false },
    })
    return messages
  }

  async deleteMessage (senderId: number, id: number): Promise<string> {
    const message = await this.MessageRepository.findOne({
      where: { senderId, id },
    })
    if (!message) {
      throw new BadRequestException(NoMessages)
    }
    await this.MessageRepository.remove(message)
    return DeleteMessage
  }
}
