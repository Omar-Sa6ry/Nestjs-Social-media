import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { RelationService } from './relation.service'
import { Relation } from './entity/relation.entity'
import { CreateRelationDto } from './dtos/createRelation.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'

@Auth(Role.USER)
@Resolver(() => Relation)
export class RelationResolver {
  constructor (
    private readonly relationService: RelationService,
    private readonly redisService: RedisService,
  ) {}

  @Mutation(() => String)
  async createRelation (
    @Args('createRelationDto') createRelationDto: CreateRelationDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<string> {
    return await this.relationService.create(createRelationDto, user.id)
  }

  @Query(() => String)
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
  async getAllRelations (
    @CurrentUser() user: CurrentUserDto,
    @Args('status') status: string,
  ): Promise<Relation[]> {
    return await this.relationService.getAll(user.id, status)
  }

  @Mutation(() => Boolean)
  async updateRelationStatus (
    @Args('id', { type: () => Int }) id: number,
    @Args('status') status: string,
  ): Promise<boolean> {
    return await this.relationService.status(id, status)
  }

  @Mutation(() => String)
  async unfriend (@Args('userName') userName: string): Promise<string> {
    return await this.relationService.unfriend(userName)
  }
}
