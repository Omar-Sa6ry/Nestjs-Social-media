import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserService } from '../users/users.service'
import DataLoader from 'dataloader'
import { createUserLoader } from 'src/common/loaders/date-loaders'
import { User } from '../users/entity/user.entity'
import { RelationResponseInput } from './dto/followResponse.dto'
import { Follow } from './entity/follow.entity'
import { Repository } from 'typeorm'
import { Status, UserStatus } from 'src/common/constant/enum.constant'
import {
  AccountPrivacy,
  NoFollowYou,
  NoFriendName,
  NoFriends,
  NoRelation,
  ThereisNoRelation,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'

@Injectable()
export class FollowService {
  private userLoader: DataLoader<number, User>

  constructor (
    private usersService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follow)
    private relationRepository: Repository<Follow>,
  ) {
    this.userLoader = createUserLoader(this.userRepository)
  }

  async follow (followerId: number, userName: string): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(NoFriendName)
    }

    const follow = await this.relationRepository.findOne({
      where: { followerId, followingId: following.id },
    })

    if (!follow) {
      let status: string
      if (following.status === UserStatus.PRIVACY) {
        status = Status.PENDING
      } else {
        status = Status.FOLLOW
      }

      const IsFriend = await this.relationRepository.findOne({
        where: { followerId: following.id, followingId: followerId },
      })
      if (IsFriend) {
        status = Status.FRIEND
        IsFriend.status = status
      }

      const createRelation = await this.relationRepository.create({
        followerId,
        status,
        followingId: following.id,
      })
      await this.relationRepository.save(createRelation)
      return `You ${
        status === Status.FOLLOW ? Status.FOLLOW : 'send request'
      }  ${userName}`
    }

    await this.relationRepository.remove(follow)
    const IsFriend = await this.relationRepository.findOne({
      where: { followerId: following.id, followingId: followerId },
    })
    if (IsFriend) {
      IsFriend.status = Status.FOLLOW
      await this.relationRepository.save(IsFriend)
    }

    return `You unfollow ${userName}`
  }

  async unfollowing (userId: number, userName: string): Promise<string> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const follow = await this.relationRepository.findOne({
      where: { followerId: user.id, followingId: userId },
    })
    if (!follow) {
      throw new BadRequestException(NoFollowYou)
    }

    if (follow.status === Status.FRIEND) {
      const isFriend = await this.relationRepository.findOne({
        where: { followingId: user.id, followerId: userId },
      })
      if (isFriend) {
        isFriend.status = Status.FOLLOW
        await this.relationRepository.save(isFriend)
      }
    }

    await this.relationRepository.remove(follow)
    return `${userName} not following you`
  }

  async get (followerId: number, followingId: number): Promise<string> {
    const follow = await this.relationRepository.findOne({
      where: { followerId, followingId },
    })
    if (!follow) {
      return NoRelation
    }
    return follow.status
  }

  async getFollower (userName: string): Promise<RelationResponseInput[]> {
    const follower = await this.usersService.findByUserName(userName)
    if (!(follower instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    if (follower.status === UserStatus.PRIVACY) {
      throw new BadRequestException(AccountPrivacy)
    }

    const follows = await this.relationRepository.find({
      where: { followerId: follower.id },
    })
    if (follows.length === 0) {
      throw new BadRequestException(ThereisNoRelation)
    }

    const users = await this.userLoader.loadMany(
      follows.map(follow => follow.followingId),
    )

    const result = await Promise.all(
      follows.map(async (follow, index) => {
        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: follow.id,
          status: follow.status,
          following: user,
          follower,
        }
      }),
    )

    return result
  }

  async getFollowing (userName: string): Promise<RelationResponseInput[]> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    if (following.status === UserStatus.PRIVACY) {
      throw new BadRequestException(AccountPrivacy)
    }

    const follows = await this.relationRepository.find({
      where: { followerId: following.id },
    })
    if (follows.length === 0) {
      throw new BadRequestException(ThereisNoRelation)
    }

    const users = await this.userLoader.loadMany(
      follows.map(follow => follow.followerId),
    )

    const result = await Promise.all(
      follows.map(async (follow, index) => {
        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: follow.id,
          status: follow.status,
          follower: user,
          following,
        }
      }),
    )
    return result
  }

  async getFriends (userId: number): Promise<RelationResponseInput[]> {
    const follows = await this.relationRepository.find({
      where: { status: Status.FRIEND, followerId: userId },
    })
    if (follows.length === 0) {
      throw new BadRequestException(NoFriends)
    }

    const followers = await this.userLoader.loadMany(
      follows.map(follow => follow.followerId),
    )
    const followings = await this.userLoader.loadMany(
      follows.map(follow => follow.followerId),
    )

    const result = await Promise.all(
      follows.map(async (follow, index) => {
        const follower = followers[index]
        if (follower instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const following = followings[index]
        if (following instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: follow.id,
          status: follow.status,
          follower,
          following,
        }
      }),
    )
    return result
  }

  async accept (
    followerId: number,
    userName: string,
    status: boolean,
  ): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const follow = await this.relationRepository.findOne({
      where: { followerId, followingId: following.id, status: Status.PENDING },
    })

    if (!follow) {
      throw new BadRequestException(`${userName} not request to follow you`)
    }

    if (status) {
      follow.status = Status.FOLLOW
      await this.relationRepository.save(follow)
      return `${userName} follow you`
    }

    await this.relationRepository.remove(follow)
    return `You rejected ${userName}`
  }
}
