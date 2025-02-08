import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { BlockService } from './block.service'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Block } from './entity/block.entity'
import { BlockResponse, BlockResponseOutput } from './dto/BlockResponse.dto'

@Resolver(() => Block)
export class BlockResolver {
  constructor (private readonly blockService: BlockService) {}

  @Mutation(() => String)
  @Auth(Role.USER)
  async blockUser (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.blockService.block(user.id, userName)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unblockUser (
    @CurrentUser() user: CurrentUserDto,
    @Args('userName') userName: string,
  ): Promise<string> {
    return this.blockService.unblock(user.id, userName)
  }

  @Query(() => BlockResponse)
  @Auth(Role.USER)
  async getBlockedUsers (
    @CurrentUser() user: CurrentUserDto,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ): Promise<BlockResponse> {
    const items = await this.blockService.getBlock(user.id, limit, skip)
    const totalCount = await this.blockService.Count(user.id)
    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }
}
