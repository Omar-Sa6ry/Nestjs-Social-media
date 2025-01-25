import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { CommentMentionResponsee } from './dto/mentionCommentResponse.dto'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CommentMentionService } from './comment-mention.service'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'

@Resolver(() => CommentMentionResponsee)
export class CommentMentionResolver {
  constructor (private readonly commentMentionService: CommentMentionService) {}

  @Mutation(() => CommentMentionResponsee)
  @Auth(Role.USER)
  async createCommentMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<CommentMentionResponsee> {
    return this.commentMentionService.create(user.id, userName, commentId)
  }

  @Query(() => CommentMentionResponsee)
  @Auth(Role.USER)
  async getCommentMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<CommentMentionResponsee> {
    return this.commentMentionService.get(user.id, userName, commentId)
  }

  @Query(() => [CommentMentionResponsee])
  @Auth(Role.USER)
  async getCommentMentionsToUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CommentMentionResponsee[]> {
    return this.commentMentionService.getTo(user.id)
  }

  @Query(() => [CommentMentionResponsee])
  @Auth(Role.USER)
  async getCommentMentionsFromUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CommentMentionResponsee[]> {
    return this.commentMentionService.getFrom(user.id)
  }

  @Query(() => [CommentMentionResponsee])
  @Auth(Role.USER)
  async getCommentMentionsForComment (
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<CommentMentionResponsee[]> {
    return this.commentMentionService.getComment(commentId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async isUserMentionedInComment (
    @Args('commentId', { type: () => Int }) commentId: number,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<boolean> {
    return this.commentMentionService.isMention(commentId, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteCommentMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.commentMentionService.delete(user.id, userName, commentId)
  }
}
