import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as firebase from 'firebase-admin'
import { CreateNotificationDto } from './dto/CreateNotificationdto'
import { UserService } from '../users/users.service'
import { Notification } from './entity/notification.entity'
import { User } from '../users/entity/user.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import DataLoader from 'dataloader'
import { createUserLoader } from 'src/common/loaders/date-loaders'
import { Repository } from 'typeorm'
import { NotificationInput } from './dto/notification.input'
import { InjectRepository } from '@nestjs/typeorm'
import {
  DeleteNotification,
  NotificationRead,
  NoNotificationsSend,
  UserNameIsWrong,
  NoNotification,
  ThisNotificationNotExosted,
  DeleteAllNotification,
} from 'src/common/constant/messages.constant'

@Injectable()
export class NotificationService {
  private senderLoader: DataLoader<number, User>
  private recieverLoader: DataLoader<number, User>

  constructor (
    private readonly websocketGateway: WebSocketMessageGateway,
    private usersService: UserService,
    private readonly redisService: RedisService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {
    this.senderLoader = createUserLoader(this.userRepository)
    this.recieverLoader = createUserLoader(this.userRepository)
  }

  async send (
    senderId: number,
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationInput> {
    const { content, userName } = createNotificationDto

    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notification = this.notificationRepository.create({
      content,
      senderId,
      receiverId: user.id,
    })
    await this.notificationRepository.save(notification)

    this.websocketGateway.broadcast('notificationSend', {
      notificationId: notification.id,
      userId: senderId,
    })

    const sender = await this.usersService.findById(senderId)
    if (!(sender instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const result = {
      id: notification.id,
      Isread: notification.Isread,
      createdAt: notification.createdAt,
      sender,
      receive: user,
    }

    try {
      await firebase
        .messaging()
        .send({
          notification: {
            title: 'new notification',
            body: notification.content,
          },
          token: sender.fcmToken,
          data: {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                contentAvailable: true,
                sound: 'default',
              },
            },
          },
        })
        .catch((error: any) => {
          console.error('errorr', error)
        })
    } catch (error) {
      console.log(error)
      return error
    }

    const relationCacheKey = `notification:${senderId}:${user.id}`
    await this.redisService.set(relationCacheKey, result)
    return result
  }

  async getAll (userId: number): Promise<NotificationInput[]> {
    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notifications = await this.notificationRepository.find({
      where: { receiverId: userId },
      order: { createdAt: 'ASC' },
    })

    if (notifications.length === 0) {
      throw new NotFoundException(NoNotificationsSend)
    }

    const senders = await this.senderLoader.loadMany(
      notifications.map(msg => msg.senderId),
    )
    const recievers = await this.recieverLoader.loadMany(
      notifications.map(msg => msg.receiverId),
    )

    const result = await Promise.all(
      notifications.map(async (notification, index) => {
        const sender = senders[index]
        if (sender instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }
        const reciever = recievers[index]
        if (reciever instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: notification.id,
          Isread: notification.Isread,
          createdAt: notification.createdAt,
          sender,
          receive: reciever,
        }
      }),
    )

    return result
  }

  async get (userId: number, id: number): Promise<NotificationInput> {
    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notification = await this.notificationRepository.findOne({
      where: { receiverId: userId, id },
    })

    if (!notification) {
      throw new NotFoundException(ThisNotificationNotExosted)
    }

    const sender = await this.usersService.findById(notification.senderId)
    if (!(sender instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const result = {
      id: notification.id,
      Isread: notification.Isread,
      createdAt: notification.createdAt,
      sender,
      receive: user,
    }

    const relationCacheKey = `notification:${sender.id}:${user.id}`
    await this.redisService.set(relationCacheKey, result)

    return result
  }

  async userNotifications (userId: number): Promise<NotificationInput[]> {
    const user = await this.usersService.findById(userId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notifications = await this.notificationRepository.find({
      where: [{ receiverId: userId }, { senderId: userId }],
      order: { createdAt: 'ASC' },
    })

    if (notifications.length === 0) {
      throw new NotFoundException(NoNotificationsSend)
    }

    const senders = await this.senderLoader.loadMany(
      notifications.map(msg => msg.senderId),
    )
    const recievers = await this.recieverLoader.loadMany(
      notifications.map(msg => msg.receiverId),
    )

    const result = await Promise.all(
      notifications.map(async (notification, index) => {
        const sender = senders[index]
        if (sender instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }
        const reciever = recievers[index]
        if (reciever instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: notification.id,
          Isread: notification.Isread,
          createdAt: notification.createdAt,
          sender,
          receive: reciever,
        }
      }),
    )

    return result
  }

  async gotNotRead (
    senderId: number,
    receiverId: number,
  ): Promise<NotificationInput[]> {
    const user = await this.usersService.findById(receiverId)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notifications = await this.notificationRepository.find({
      where: { receiverId, senderId, Isread: false },
    })

    const senders = await this.senderLoader.loadMany(
      notifications.map(msg => msg.senderId),
    )
    const recievers = await this.recieverLoader.loadMany(
      notifications.map(msg => msg.receiverId),
    )

    const result = await Promise.all(
      notifications.map(async (notification, index) => {
        const sender = senders[index]
        if (sender instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }
        const reciever = recievers[index]
        if (reciever instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: notification.id,
          Isread: notification.Isread,
          createdAt: notification.createdAt,
          sender,
          receive: reciever,
        }
      }),
    )

    return result
  }

  async markNotificationRead (
    senderId: number,
    userName: string,
  ): Promise<string> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notifications = await this.notificationRepository.findOne({
      where: { senderId, receiverId: user.id, Isread: false },
    })

    await this.notificationRepository.save(notifications)
    return NotificationRead
  }

  async markAllNotificationRead (
    senderId: number,
    userName: string,
  ): Promise<string> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notifications = await this.notificationRepository.find({
      where: { senderId, receiverId: user.id, Isread: false },
    })

    for (const Notification of notifications) {
      Notification.Isread = true
    }
    await this.notificationRepository.save(notifications)
    return NotificationRead
  }

  async delete (senderId: number, id: number): Promise<string> {
    const notification = await this.notificationRepository.findOne({
      where: { senderId, id },
    })
    if (!notification) {
      throw new BadRequestException(NoNotification)
    }
    await this.notificationRepository.remove(notification)
    this.websocketGateway.broadcast('notigicationSend', {
      NotificationId: notification.id,
      userId: senderId,
    })
    return DeleteNotification
  }

  async deleteAll (receiverId: number): Promise<string> {
    const notifications = await this.notificationRepository.find({
      where: { receiverId },
    })
    if (!notifications) {
      throw new BadRequestException(NoNotification)
    }
    await this.notificationRepository.remove(notifications)
    return DeleteAllNotification
  }
}
