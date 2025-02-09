import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { Notification } from './entity/notification.entity'
import { CreateNotificationDto } from './dto/CreateNotificationdto'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import {
  NotificationResponse,
  NotificationsResponse,
} from './dto/notification.output'

@Resolver(() => Notification)
export class NotificationResolver {
  constructor (private readonly notificationService: NotificationService) {}

  @Mutation(() => NotificationResponse)
  @Auth(Role.USER)
  async sendNotification (
    @CurrentUser() user: CurrentUserDto,
    @Args('createNotificationDto') createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponse> {
    return {
      data: await this.notificationService.send(user.id, createNotificationDto),
    }
  }

  @Query(() => NotificationsResponse)
  @Auth(Role.USER)
  async getAllNotifications (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<NotificationsResponse> {
    return { items: await this.notificationService.getAll(user.id) }
  }

  @Query(() => NotificationResponse)
  @Auth(Role.USER)
  async getNotificationById (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<NotificationResponse> {
    return { data: await this.notificationService.get(user.id, id) }
  }

  @Query(() => NotificationsResponse)
  @Auth(Role.USER)
  async userNotifications (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<NotificationsResponse> {
    return { items: await this.notificationService.userNotifications(user.id) }
  }

  @Query(() => NotificationsResponse)
  @Auth(Role.USER)
  async unreadNotifications (
    @CurrentUser() user: CurrentUserDto,
    @Args('receiverId', { type: () => Int }) receiverId: number,
  ): Promise<NotificationsResponse> {
    return {
      items: await this.notificationService.gotNotRead(user.id, receiverId),
    }
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async markNotificationAsRead (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<string> {
    return this.notificationService.markNotificationRead(user.id, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async markAllNotificationsAsRead (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<string> {
    return this.notificationService.markAllNotificationRead(user.id, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteNotification (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<string> {
    return this.notificationService.delete(user.id, id)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteAllNotifications (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<string> {
    return this.notificationService.deleteAll(user.id)
  }
}
