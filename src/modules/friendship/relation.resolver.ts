import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { RelationService } from './relation.service'
import { Relation } from './entity/relation.entity'
import { CreateRelationDto } from './dtos/createRelation.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'

@Resolver(() => Relation)
export class RelationResolver {
  constructor (
    private readonly relationService: RelationService,
    private readonly redisService: RedisService,
  ) {}

  @Mutation(() => String)
  @Auth(Role.USER)
  async createRelation (
    @Args('createRelationDto') createRelationDto: CreateRelationDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<string> {
    return await this.relationService.create(createRelationDto, user.id)
  }

  @Query(() => String)
  @Auth(Role.USER)
  async getRelationStatus (
    @CurrentUser() user: CurrentUserDto,
    @Args('friendId', { type: () => Int }) friendId: number,
  ): Promise<string> {
    const relationCacheKey = `relation:${user.id}`
    const cachedRelation = await this.redisService.get(relationCacheKey)
    if (cachedRelation instanceof Relation) {
      return cachedRelation.status
    }

    return await this.relationService.get(user.id, friendId)
  }

  @Query(() => [Relation])
  @Auth(Role.USER)
  async getAllRelations (
    @CurrentUser() user: CurrentUserDto,
    @Args('status') status: string,
  ): Promise<Relation[]> {
    return await this.relationService.getAll(user.id, status)
  }

  @Mutation(() => Boolean)
  @Auth(Role.USER)
  async updateRelationStatus (
    @Args('userName') userName: string,
    @Args('status') status: string,
  ): Promise<boolean> {
    return await this.relationService.status(userName, status)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unfriend (@Args('userName') userName: string): Promise<string> {
    return await this.relationService.unfriend(userName)
  }
}
