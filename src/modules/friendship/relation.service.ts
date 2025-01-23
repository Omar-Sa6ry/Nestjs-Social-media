import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserService } from '../users/users.service'
import { User } from '../users/entity/user.entity'
import { Repository } from 'typeorm'
import { Relation } from './entity/relation.entity'
import { RedisService } from 'src/common/redis/redis.service'
import { Status } from 'src/common/constant/enum.constant'
import { CreateRelationDto } from './dtos/createRelation.dto'
import {
  NoFriendName,
  ThereisNoRelation,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'

@Injectable()
export class RelationService {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
    @InjectRepository(Relation)
    private RelationRepository: Repository<Relation>,
  ) {}

  async create (
    createRelationDto: CreateRelationDto,
    userId: number,
  ): Promise<string> {
    const { userName, status } = createRelationDto
    const checkFriend = await this.usersService.findByUserName(userName)
    if (!(checkFriend instanceof User)) {
      throw new NotFoundException(NoFriendName)
    }

    const relation = await this.RelationRepository.findOne({
      where: { userId, friendId: checkFriend.id },
    })
    if (!relation) {
      const createRelation = await this.RelationRepository.create({
        userId,
        status,
        friendId: checkFriend.id,
      })
      console.log(createRelation)
      await this.RelationRepository.save(createRelation)
      const relationCacheKey = `relation:${userId}`
      await this.redisService.set(relationCacheKey, userId)

      return `The Relation between you and ${userName} is ${status}`
    }

    relation.status = status
    await this.RelationRepository.save(relation)
    return `The Relation between you and ${userName} is ${status}`
  }

  async get (userId: number, friendId: number): Promise<string> {
    const relation = await this.RelationRepository.findOne({
      where: { userId, friendId },
    })
    if (!relation) {
      console.log('jiji')
      return Status.UNKNOWN
    }
    const relationCacheKey = `relation:${userId}`
    await this.redisService.set(relationCacheKey, userId)

    return relation.status
  }

  async getAll (userId: number, status: string): Promise<Relation[]> {
    const relations = await this.RelationRepository.find({
      where: { userId, status },
    })
    if (relations.length === 0) {
      throw new BadRequestException(ThereisNoRelation)
    }

    return relations
  }

  async status (userName: string, status: string): Promise<boolean> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }

    const relation = await this.RelationRepository.findOne({
      where: { friendId: user.id },
    })
    if (!relation) {
      throw new BadRequestException(ThereisNoRelation)
    }

    relation.status = status
    await this.RelationRepository.save(relation)
    return true
  }

  async unfriend (userName: string): Promise<string> {
    const user = await this.usersService.findByUserName(userName)
    if (!(user instanceof User)) {
      throw new NotFoundException(UserNameIsWrong)
    }
    const relation = await this.RelationRepository.findOne({
      where: { friendId: user.id },
    })
    if (!relation) {
      throw new BadRequestException(ThereisNoRelation)
    }
    await this.RelationRepository.remove(relation)
    return ThereisNoRelation
  }
}
