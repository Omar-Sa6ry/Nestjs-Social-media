import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateNotificationDto } from './dto/createNotificationdto'
import { UserService } from '../users/users.service'
import { Notification } from './entity/notification.entity'
import { User } from '../users/entity/user.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { Repository } from 'typeorm'
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
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async send (
    senderId: number,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const { content, userName } = createNotificationDto
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const notification = await this.notificationRepository.create({
      content,
      senderId,
      receiverId: user.id,
    })
    await this.notificationRepository.save(notification)

    const relationCacheKey = `notification:${senderId}:${user.id}`
    await this.redisService.set(relationCacheKey, notification)
    return notification
  }

  async getAll (userId: number): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: { receiverId: userId },
      order: { createdAt: 'ASC' },
    })

    if (notifications.length === 0) {
      throw new NotFoundException(NoNotificationsSend)
    }

    const relationCacheKey = `notification:${userId}`
    await this.redisService.set(relationCacheKey, notifications)
    return notifications
  }

  async get (userId: number, id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { receiverId: userId, id },
    })

    if (!notification) {
      throw new NotFoundException(ThisNotificationNotExosted)
    }

    const relationCacheKey = `notification:${userId}:${id}`
    await this.redisService.set(relationCacheKey, notification)
    return notification
  }

  async userNotifications (userId: number): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: [{ receiverId: userId }, { senderId: userId }],
      order: { createdAt: 'ASC' },
    })

    if (notifications.length === 0) {
      throw new NotFoundException(NoNotificationsSend)
    }

    const relationCacheKey = `Notification:${userId}`
    await this.redisService.set(relationCacheKey, notifications)
    return notifications
  }

  async gotNotRead (
    senderId: number,
    receiverId: number,
  ): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: { receiverId, senderId, Isread: false },
    })
    return notifications
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
