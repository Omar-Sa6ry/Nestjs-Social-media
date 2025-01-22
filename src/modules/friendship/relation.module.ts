import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entity/user.entity'
import { UserModule } from '../users/users.module'
import { Relation } from './entity/relation.entity'
import { RelationService } from './relation.service'
import { RelationResolver } from './relation.resolver'
import { RedisModule } from 'src/common/redis/redis.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Relation]),
    RedisModule,
    UserModule,
  ],
  providers: [RelationResolver, RelationService],
})
export class RelationModule {}
