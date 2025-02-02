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
import DataLoader from 'dataloader'
import { createUserLoader } from 'src/common/loaders/date-loaders'

@Injectable()
export class MessageService {
  private senderLoader: DataLoader<number, User>
  private recieverLoader: DataLoader<number, User>

  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {
    this.senderLoader = createUserLoader(this.userRepository)
    this.recieverLoader = createUserLoader(this.userRepository)
  }

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

    const senders = await this.senderLoader.loadMany(
      messages.map(msg => msg.senderId),
    )
    const recievers = await this.recieverLoader.loadMany(
      messages.map(msg => msg.receiverId),
    )

    const result = await Promise.all(
      messages.map(async (message, index) => {
        const sender = senders[index]
        if (sender instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }
        const reciever = recievers[index]
        if (reciever instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: message.id,
          content: message.content,
          Isread: message.Isread,
          createdAt: message.createdAt,
          sender,
          receive: reciever,
        }
      }),
    )

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

    const senders = await this.senderLoader.loadMany(
      messages.map(msg => msg.senderId),
    )
    const recievers = await this.recieverLoader.loadMany(
      messages.map(msg => msg.receiverId),
    )

    const result = await Promise.all(
      messages.map(async (message, index) => {
        const sender = senders[index]
        if (sender instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }
        const reciever = recievers[index]
        if (reciever instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: message.id,
          content: message.content,
          Isread: message.Isread,
          createdAt: message.createdAt,
          sender,
          receive: reciever,
        }
      }),
    )
    return result
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

    const senders = await this.senderLoader.loadMany(
      messages.map(msg => msg.senderId),
    )
    const recievers = await this.recieverLoader.loadMany(
      messages.map(msg => msg.receiverId),
    )

    const result = await Promise.all(
      messages.map(async (message, index) => {
        const sender = senders[index]
        if (sender instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }
        const reciever = recievers[index]
        if (reciever instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: message.id,
          content: message.content,
          Isread: message.Isread,
          createdAt: message.createdAt,
          sender,
          receive: reciever,
        }
      }),
    )

    return result
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
