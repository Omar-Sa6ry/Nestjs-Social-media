import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserService } from '../users/users.service'
import { User } from '../users/entity/user.entity'
import { RelationResponseInput } from './dto/relationResponse.dto'
import { Repository } from 'typeorm'
import { Relation } from './entity/relation.entity'
import { Status, UserStatus } from 'src/common/constant/enum.constant'
import {
  AccountPrivacy,
  NoBlocks,
  NoFollowYou,
  NoFriendName,
  NoFriends,
  NoRelation,
  ThereisNoRelation,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'

@Injectable()
export class RelationService {
  constructor (
    private usersService: UserService,
    @InjectRepository(Relation)
    private relationRepository: Repository<Relation>,
  ) {}

  async follow (followerId: number, userName: string): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(NoFriendName)
    }

    const relation = await this.relationRepository.findOne({
      where: { followerId, followingId: following.id },
    })

    if (!relation) {
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

    await this.relationRepository.remove(relation)
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

    const relation = await this.relationRepository.findOne({
      where: { followerId: user.id, followingId: userId },
    })
    if (!relation) {
      throw new BadRequestException(NoFollowYou)
    }

    if (relation.status === Status.FRIEND) {
      const isFriend = await this.relationRepository.findOne({
        where: { followingId: user.id, followerId: userId },
      })
      if (isFriend) {
        isFriend.status = Status.FOLLOW
        await this.relationRepository.save(isFriend)
      }
    }

    await this.relationRepository.remove(relation)
    return `${userName} not following you`
  }

  async get (followerId: number, followingId: number): Promise<string> {
    const relation = await this.relationRepository.findOne({
      where: { followerId, followingId },
    })
    if (!relation) {
      return NoRelation
    }
    return relation.status
  }

  async getFollower (userName: string): Promise<RelationResponseInput[]> {
    const follower = await this.usersService.findByUserName(userName)
    if (!(follower instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    if (follower.status === UserStatus.PRIVACY) {
      throw new BadRequestException(AccountPrivacy)
    }

    const relations = await this.relationRepository.find({
      where: { followerId: follower.id },
    })
    if (relations.length === 0) {
      throw new BadRequestException(ThereisNoRelation)
    }

    const result = []
    for (const relation of relations) {
      const following = await this.usersService.findById(relation.followingId)
      result.push({ follower, following, status: relation.status })
    }
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

    const relations = await this.relationRepository.find({
      where: { followerId: following.id },
    })
    if (relations.length === 0) {
      throw new BadRequestException(ThereisNoRelation)
    }

    const result = []
    for (const relation of relations) {
      const follower = await this.usersService.findById(relation.followingId)
      result.push({ following, follower, status: relation.status })
    }
    return result
  }

  async getFriends (userId: number): Promise<RelationResponseInput[]> {
    const relations = await this.relationRepository.find({
      where: { status: Status.FRIEND, followerId: userId },
    })
    if (relations.length === 0) {
      throw new BadRequestException(NoFriends)
    }

    const result = []
    for (const relation of relations) {
      const follower = await this.usersService.findById(relation.followerId)
      const following = await this.usersService.findById(relation.followingId)
      result.push({ follower, following, status: Status.FRIEND })
    }
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

    const relation = await this.relationRepository.findOne({
      where: { followerId, followingId: following.id, status: Status.PENDING },
    })

    if (!relation) {
      throw new BadRequestException(`${userName} not request to follow you`)
    }

    if (status) {
      relation.status = Status.FOLLOW
      await this.relationRepository.save(relation)
      return `${userName} follow you`
    }

    await this.relationRepository.remove(relation)
    return `You rejected ${userName}`
  }

  async block (followerId: number, userName: string): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const relation = await this.relationRepository.findOne({
      where: { followerId, followingId: following.id },
    })

    if (!relation) {
      const newRelation = this.relationRepository.create({
        followerId,
        followingId: following.id,
        status: Status.BLOCK,
      })

      await this.relationRepository.save(newRelation)
      return `You have blocked ${userName}`
    }

    relation.status = Status.BLOCK
    await this.relationRepository.save(relation)

    return `You have blocked ${userName}`
  }

  async unblock (followerId: number, userName: string): Promise<string> {
    const following = await this.usersService.findByUserName(userName)
    if (!(following instanceof User)) {
      throw new NotFoundException(`User with username ${userName} not found`)
    }

    const relation = await this.relationRepository.findOne({
      where: { followerId, followingId: following.id, status: Status.BLOCK },
    })

    if (!relation) {
      throw new BadRequestException(`You have not blocked ${userName}`)
    }
    await this.relationRepository.remove(relation)
    return `You have unblocked ${userName}`
  }

  async getBlock (userId: number): Promise<RelationResponseInput[]> {
    const relations = await this.relationRepository.find({
      where: { status: Status.BLOCK, followerId: userId },
    })
    if (relations.length === 0) {
      throw new BadRequestException(NoBlocks)
    }

    const result = []
    for (const relation of relations) {
      const follower = await this.usersService.findById(relation.followerId)
      const following = await this.usersService.findById(relation.followingId)
      result.push({ follower, following, status: Status.BLOCK })
    }
    return result
  }
}
