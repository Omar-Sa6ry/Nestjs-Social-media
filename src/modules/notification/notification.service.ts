import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateNotificationDto } from './dto/CreateNotificationdto'
import { UserService } from '../users/users.service'
import { Notification } from './entity/notification.entity'
import * as firebase from 'firebase-admin'
import * as shell from 'shelljs'
import { User } from '../users/entity/user.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { Repository } from 'typeorm'
import { NotificationInput } from './dto/notification.input'
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

    const relationCacheKey = `notification:${senderId}:${user.id}`
    await this.redisService.set(relationCacheKey, result)

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

    const result = []

    for (const notification of notifications) {
      const sender = await this.usersService.findById(notification.senderId)
      if (!(sender instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      result.push({
        id: notification.id,
        Isread: notification.Isread,
        createdAt: notification.createdAt,
        sender,
        receive: user,
      })
    }

    const relationCacheKey = `notification:${userId}`
    await this.redisService.set(relationCacheKey, result)

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

    const result = []

    for (const notification of notifications) {
      const sender = await this.usersService.findById(notification.senderId)
      if (!(sender instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      result.push({
        id: notification.id,
        Isread: notification.Isread,
        createdAt: notification.createdAt,
        sender,
        receive: user,
      })
    }
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

    const result = []

    for (const notification of notifications) {
      const sender = await this.usersService.findById(notification.senderId)
      if (!(sender instanceof User)) {
        throw new NotFoundException(UserNameIsWrong)
      }

      result.push({
        id: notification.id,
        Isread: notification.Isread,
        createdAt: notification.createdAt,
        sender,
        receive: user,
      })
    }
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
