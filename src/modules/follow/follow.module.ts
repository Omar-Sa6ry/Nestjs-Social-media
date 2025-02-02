import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { FollowService } from './follow.service'
import { FollowResolver } from './follow.resolver'
import { User } from '../users/entity/user.entity'
import { Follow } from './entity/follow.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
    RedisModule,
    UserModule,
  ],
  providers: [FollowResolver, FollowService],
})
export class RelationModule {}
