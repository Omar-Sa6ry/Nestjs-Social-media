import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { RelationService } from './relation.service'
import { RelationResponseOutput } from './dto/RelationResponse.dto'
import { User } from '../users/entity/user.entity'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Relation } from './entity/relation.entity'

@Resolver(() => Relation)
export class RelationResolver {
  constructor (private readonly relationService: RelationService) {}

  @Mutation(() => String)
  @Auth(Role.USER)
  async blockUser (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.relationService.block(user.id, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unblockUser (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.relationService.unblock(user.id, userName)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getBlockedUsers (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RelationResponseOutput[]> {
    return this.relationService.getBlock(user.id)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async followUser (
    @CurrentUser() user: User,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.relationService.follow(user.id, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unfollowingUser (
    @CurrentUser() user: User,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.relationService.unfollowing(user.id, userName)
  }

  @Query(() => String)
  @Auth(Role.USER)
  async getRelationStatus (
    @CurrentUser() user: User,
    @Args('followingId') followingId: number,
  ): Promise<string> {
    return this.relationService.get(user.id, followingId)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getFollowers (
    @Args('userName') userName: string,
  ): Promise<RelationResponseOutput[]> {
    return this.relationService.getFollower(userName)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getFollowings (
    @Args('userName') userName: string,
  ): Promise<RelationResponseOutput[]> {
    return this.relationService.getFollowing(userName)
  }

  @Query(() => [RelationResponseOutput])
  @Auth(Role.USER)
  async getFriends (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RelationResponseOutput[]> {
    return this.relationService.getFriends(user.id)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async acceptFollowRequest (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName') userName: string,
    @Args('status') status: boolean,
  ): Promise<string> {
    return this.relationService.accept(user.id, userName, status)
  }
}
