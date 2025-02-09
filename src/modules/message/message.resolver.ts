import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { MessageService } from './message.service'
import { Message } from './entity/message.entity'
import { CreateMessageDto } from './dto/CreateMessage.dto'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { MessageResponse, MessagesResponse } from './dto/message.output '

@Resolver(() => Message)
export class MessageResolver {
  constructor (private readonly messageService: MessageService) {}

  @Mutation(() => MessageResponse)
  @Auth(Role.USER)
  async sendMessage (
    @CurrentUser() user: CurrentUserDto,
    @Args('createMessageDto') createMessageDto: CreateMessageDto,
  ): Promise<MessageResponse> {
    return { data: await this.messageService.send(user.id, createMessageDto) }
  }

  @Query(() => MessagesResponse)
  @Auth(Role.USER)
  async chat (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<MessagesResponse> {
    return { items: await this.messageService.chat(user.id, userName) }
  }

  @Query(() => MessagesResponse)
  @Auth(Role.USER)
  async userMessages (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MessagesResponse> {
    return { items: await this.messageService.userMessages(user.id) }
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async markMessageAsRead (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<string> {
    return this.messageService.markMessageRead(user.id, userName)
  }

  @Query(() => MessagesResponse)
  @Auth(Role.USER)
  async unreadMessages (
    @CurrentUser() user: CurrentUserDto,
    @Args('receiverId', { type: () => Int }) receiverId: number,
  ): Promise<MessagesResponse> {
    return { items: await this.messageService.gotNotRead(user.id, receiverId) }
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteMessage (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<string> {
    return this.messageService.deleteMessage(user.id, id)
  }
}
