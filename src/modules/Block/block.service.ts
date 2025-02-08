import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserService } from '../users/users.service'
import { Block } from './entity/block.entity'
import DataLoader from 'dataloader'
import { createUserLoader } from 'src/common/loaders/date-loaders'
import { User } from '../users/entity/user.entity'
import { BlockResponseInput } from './dto/BlockResponse.dto'
import { Repository } from 'typeorm'
import {
  NoBlocks,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'

@Injectable()
export class BlockService {
  private followerLoader: DataLoader<number, User>
  private followingLoader: DataLoader<number, User>

  constructor (
    private usersService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {
    this.followerLoader = createUserLoader(this.userRepository)
    this.followingLoader = createUserLoader(this.userRepository)
  }

  async block (followerId: number, userName: string): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const relation = await this.blockRepository.findOne({
      where: { followerId, followingId: following.id },
    })

    if (!relation) {
      const newRelation = this.blockRepository.create({
        followerId,
        followingId: following.id,
      })

      await this.blockRepository.save(newRelation)
      return `You have blocked ${userName}`
    }

    await this.blockRepository.save(relation)

    return `You have blocked ${userName}`
  }

  async unblock (followerId: number, userName: string): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(`User with username ${userName} not found`)
    }

    const relation = await this.blockRepository.findOne({
      where: { followerId, followingId: following.id },
    })

    if (!relation) {
      throw new BadRequestException(`You have not blocked ${userName}`)
    }
    await this.blockRepository.remove(relation)
    return `You have unblocked ${userName}`
  }

  async getBlock (
    userId: number,
    limit: number,
    skip: number,
  ): Promise<BlockResponseInput[]> {
    const blocks = await this.blockRepository.find({
      where: { followerId: userId },
      skip,
      take: limit,
      order: { id: 'DESC' },
    })
    if (blocks.length === 0) {
      throw new BadRequestException(NoBlocks)
    }

    const followers = await this.followerLoader.loadMany(
      blocks.map(follow => follow.followerId),
    )
    const followings = await this.followingLoader.loadMany(
      blocks.map(follow => follow.followingId),
    )

    const result = await Promise.all(
      blocks.map(async (block, index) => {
        const follower = followers[index]
        if (follower instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const following = followings[index]
        if (following instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return { id: block.id, follower, following }
      }),
    )

    return result
  }

  async Count (userId: number) {
    const count = await this.blockRepository.count({
      where: { followerId: userId },
    })

    return count
  }
}
