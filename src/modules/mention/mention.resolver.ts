import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { PostMentionResponsee } from './dtos/mentionPostResponse.dto'
import { Mention } from './entity/mention.entity '
import { MentionService } from './mention.service'
import { CommentMentionResponsee } from './dtos/MentionCommentResponse.dto'

@Resolver(() => Mention)
export class MentionResolver {
  constructor (private readonly mentionService: MentionService) {}

  // -----------Post----------

  @Mutation(() => PostMentionResponsee)
  @Auth(Role.USER)
  async createPostMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<PostMentionResponsee> {
    return await this.mentionService.createPostMention(
      user.id,
      userName,
      postId,
    )
  }

  @Query(() => PostMentionResponsee)
  @Auth(Role.USER)
  async getPostMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<PostMentionResponsee> {
    return this.mentionService.getPostMention(user.id, userName, postId)
  }

  @Query(() => [PostMentionResponsee])
  @Auth(Role.USER)
  async postMentionsToUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostMentionResponsee[]> {
    return this.mentionService.getToPost(user.id)
  }

  @Query(() => [PostMentionResponsee])
  @Auth(Role.USER)
  async postMentionsFromUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostMentionResponsee[]> {
    return this.mentionService.getFromPost(user.id)
  }

  @Query(() => [PostMentionResponsee])
  @Auth(Role.USER)
  async mentionsForPost (
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<PostMentionResponsee[]> {
    return this.mentionService.getPost(postId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async isUserPostMentioned (
    @Args('postId', { type: () => Int }) postId: number,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<boolean> {
    return this.mentionService.isPostMention(postId, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deletePostMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<string> {
    return this.mentionService.deletePostMention(user.id, userName, postId)
  }

  // --------------------comment----------------------

  @Mutation(() => CommentMentionResponsee)
  @Auth(Role.USER)
  async createCommentMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<CommentMentionResponsee> {
    return this.mentionService.createCommentMention(
      user.id,
      userName,
      commentId,
    )
  }

  @Query(() => CommentMentionResponsee)
  @Auth(Role.USER)
  async getCommentMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<CommentMentionResponsee> {
    return this.mentionService.getMentionComment(user.id, userName, commentId)
  }

  @Query(() => [CommentMentionResponsee])
  @Auth(Role.USER)
  async getCommentMentionsToUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CommentMentionResponsee[]> {
    return this.mentionService.getToComment(user.id)
  }

  @Query(() => [CommentMentionResponsee])
  @Auth(Role.USER)
  async getCommentMentionsFromUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CommentMentionResponsee[]> {
    return this.mentionService.getFromComment(user.id)
  }

  @Query(() => [CommentMentionResponsee])
  @Auth(Role.USER)
  async getCommentMentionsForComment (
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<CommentMentionResponsee[]> {
    return this.mentionService.getComment(commentId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async isUserMentionedInComment (
    @Args('commentId', { type: () => Int }) commentId: number,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<boolean> {
    return this.mentionService.isCommentMention(commentId, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteCommentMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.mentionService.deleteCommentMention(
      user.id,
      userName,
      commentId,
    )
  }
}
