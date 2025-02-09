import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ReplyService } from './reply.service'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { User } from '../users/entity/user.entity'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { ReplyResponse, ReplysResponse } from './dto/ReplyResponse.dto'
import { Reply } from './entity/reply.entity'

@Resolver(() => Reply)
export class ReplyResolver {
  constructor (private readonly replyService: ReplyService) {}

  @Mutation(() => ReplyResponse)
  @Auth(Role.USER)
  async writeReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId') commentId: number,
    @Args('content') content: string,
  ): Promise<ReplyResponse> {
    return { data: await this.replyService.write(user.id, commentId, content) }
  }

  @Query(() => ReplyResponse)
  @Auth(Role.USER)
  async getReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId') commentId: number,
    @Args('content') content: string,
  ): Promise<ReplyResponse> {
    return { data: await this.replyService.get(user.id, commentId, content) }
  }

  @Query(() => ReplysResponse)
  @Auth(Role.USER)
  async getRepliesByComment (
    @Args('commentId') commentId: number,
  ): Promise<ReplysResponse> {
    return { items: await this.replyService.getCommentPost(commentId) }
  }

  @Query(() => Number)
  @Auth(Role.USER)
  async getRepliesCount (@Args('commentId') commentId: number): Promise<number> {
    return await this.replyService.getCountCommentPost(commentId)
  }

  @Query(() => ReplysResponse)
  @Auth(Role.USER)
  async getRepliesByUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<ReplysResponse> {
    return { items: await this.replyService.getCommentUser(user.id) }
  }

  @Query(() => ReplysResponse)
  @Auth(Role.USER)
  async getLastReplies (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId') commentId: number,
    @Args('paginationDto') paginationDto: PaginationDto,
  ): Promise<ReplysResponse> {
    return {
      items: await this.replyService.getLastComment(
        user.id,
        commentId,
        paginationDto,
      ),
    }
  }

  @Query(() => User)
  @Auth(Role.USER)
  async getUserByReply (@Args('id') id: number): Promise<User> {
    return await this.replyService.getUserByComment(id)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async updateReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: number,
    @Args('content') content: string,
  ): Promise<string> {
    return await this.replyService.update(user.id, id, content)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: number,
  ): Promise<string> {
    return await this.replyService.delete(user.id, id)
  }
}
