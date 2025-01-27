import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateNotificationDto } from './dto/createNotificationdto'
import { UserService } from '../users/users.service'
import { Notification } from './entity/notification.entity'
import * as firebase from 'firebase-admin'
import * as shell from 'shelljs'
import { User } from '../users/entity/user.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { Repository } from 'typeorm'
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api'
import { InjectRepository } from '@nestjs/typeorm'
import { mapLimit } from 'async'
import { chunk } from 'lodash'
import {
  DeleteNotification,
  NotificationRead,
  NoNotificationsSend,
  UserNameIsWrong,
  NoNotification,
  ThisNotificationNotExosted,
  DeleteAllNotification,
} from 'src/common/constant/messages.constant'

// Other methods...
export interface ISendFirebaseMessages {
  token: string
  title?: string
  message: string
}

@Injectable()
export class NotificationService {
  constructor (
    private readonly websocketGateway: WebSocketMessageGateway,
    private usersService: UserService,
    private readonly redisService: RedisService,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {
    const firebaseCredentials = JSON.parse(process.env.FIREBASE_CREDENTIAL_JSON)
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  }

  // public async sendFirebaseMessages (
  //   firebaseMessages: ISendFirebaseMessages[],
  //   dryRun?: boolean,
  // ): Promise<BatchResponse> {
  //   const batchedFirebaseMessages = chunk(firebaseMessages, 500)

  //   const batchResponses = await mapLimit<
  //     ISendFirebaseMessages[],
  //     BatchResponse
  //   >(
  //     batchedFirebaseMessages,
  //     process.env.FIREBASE_PARALLEL_LIMIT, // 3 is a good place to start
  //     async (
  //       groupedFirebaseMessages: ISendFirebaseMessages[],
  //     ): Promise<BatchResponse> => {
  //       try {
  //         const tokenMessages: firebase.messaging.TokenMessage[] =
  //           groupedFirebaseMessages.map(({ message, title, token }) => ({
  //             notification: { body: message, title },
  //             token,
  //             apns: {
  //               payload: {
  //                 aps: {
  //                   'content-available': 1,
  //                 },
  //               },
  //             },
  //           }))

  //         return await this.sendAll(tokenMessages, dryRun)
  //       } catch (error) {
  //         return {
  //           responses: groupedFirebaseMessages.map(() => ({
  //             success: false,
  //             error,
  //           })),
  //           successCount: 0,
  //           failureCount: groupedFirebaseMessages.length,
  //         }
  //       }
  //     },
  //   )

  //   return batchResponses.reduce(
  //     ({ responses, successCount, failureCount }, currentResponse) => {
  //       return {
  //         responses: responses.concat(currentResponse.responses),
  //         successCount: successCount + currentResponse.successCount,
  //         failureCount: failureCount + currentResponse.failureCount,
  //       }
  //     },
  //     {
  //       responses: [],
  //       successCount: 0,
  //       failureCount: 0,
  //     } as unknown as BatchResponse,
  //   )
  // }

  // public async sendAll (
  //   messages: firebase.messaging.TokenMessage[],
  //   dryRun?: boolean,
  // ): Promise<BatchResponse> {
  //   if (process.env.NODE_ENV === 'local') {
  //     for (const { notification, token } of messages) {
  //       shell.exec(
  //         `echo '{ "aps": { "alert": ${JSON.stringify(
  //           notification,
  //         )}, "token": "${token}" } }' | xcrun simctl push booted com.company.appname -`,
  //       )
  //     }
  //   }
  //   return firebase.messaging().sendAll(messages, dryRun)
  // }

  async send (
    senderId: number,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
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

    const relationCacheKey = `notification:${senderId}:${user.id}`
    await this.redisService.set(relationCacheKey, notification)

    this.websocketGateway.broadcast('notificationSend', {
      notificationId: notification.id,
      userId: senderId,
    })

    // const firebaseMessages: ISendFirebaseMessages[] = [
    //   {
    //     token: user.firebaseToken, 
    //     message: content,
    //     title: 'New Notification', 
    //   },
    // ]

    // try {
    //   const response = await this.sendFirebaseMessages(firebaseMessages)
    //   console.log(response)
    //   console.log('Push notifications sent:', response.successCount)
    // } catch (error) {
    //   console.error('Error sending push notification:', error.message)
    // }

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
