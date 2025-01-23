import { Module } from '@nestjs/common'
import { MessageResolver } from './message.resolver'
import { MessageService } from './message.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './entity/message.entity'
import { RedisModule } from 'src/common/redis/redis.module'
import { UserModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Message]), RedisModule, UserModule],
  providers: [MessageResolver, MessageService],
})
export class MessageModule {}
