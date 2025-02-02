import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { FollowService } from './follow.service'
import { RelationResponseOutput } from './dto/followResponse.dto'
import { User } from '../users/entity/user.entity'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Follow } from './entity/follow.entity'

@Resolver(() => Follow)
export class FollowResolver {
  constructor (private readonly followService: FollowService) {}

  @Mutation(() => String)
  @Auth(Role.USER)
  async followUser (
    @CurrentUser() user: User,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.followService.follow(user.id, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unfollowingUser (
    @CurrentUser() user: User,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.followService.unfollowing(user.id, userName)
  }

  @Query(() => String)
  @Auth(Role.USER)
  async getRelationStatus (
    @CurrentUser() user: User,
    @Args('followingId') followingId: number,
  ): Promise<string> {
    return this.followService.get(user.id, followingId)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getFollowers (
    @Args('userName') userName: string,
  ): Promise<RelationResponseOutput[]> {
    return this.followService.getFollower(userName)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getFollowings (
    @Args('userName') userName: string,
  ): Promise<RelationResponseOutput[]> {
    return this.followService.getFollowing(userName)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getFriends (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RelationResponseOutput[]> {
    return this.followService.getFriends(user.id)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async acceptFollowRequest (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName') userName: string,
    @Args('status') status: boolean,
  ): Promise<string> {
    return this.followService.accept(user.id, userName, status)
  }
}
