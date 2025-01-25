import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { PostMentionService } from './post-mention.service'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { PostMention } from './entity/mentionPost.entity '
import { PostMentionResponsee } from './dto/mentionPostResponse.dto'

@Resolver(() => PostMention)
export class PostMentionResolver {
  constructor (private readonly postMentionService: PostMentionService) {}

  @Mutation(() => PostMentionResponsee)
  @Auth(Role.USER)
  async createMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<PostMentionResponsee> {
    return await this.postMentionService.create(user.id, userName, postId)
  }

  @Query(() => PostMentionResponsee)
  @Auth(Role.USER)
  async getMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<PostMentionResponsee> {
    return this.postMentionService.get(user.id, userName, postId)
  }

  @Query(() => [PostMentionResponsee])
  @Auth(Role.USER)
  async mentionsToUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostMentionResponsee[]> {
    return this.postMentionService.getTo(user.id)
  }

  @Query(() => [PostMentionResponsee])
  @Auth(Role.USER)
  async mentionsFromUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostMentionResponsee[]> {
    return this.postMentionService.getFrom(user.id)
  }

  @Query(() => [PostMentionResponsee])
  @Auth(Role.USER)
  async mentionsForPost (
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<PostMentionResponsee[]> {
    return this.postMentionService.getPost(postId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async isUserMentioned (
    @Args('postId', { type: () => Int }) postId: number,
    @Args('userName', { type: () => String }) userName: string,
  ): Promise<boolean> {
    return this.postMentionService.isMention(postId, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteMention (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName', { type: () => String }) userName: string,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<string> {
    return this.postMentionService.delete(user.id, userName, postId)
  }
}
