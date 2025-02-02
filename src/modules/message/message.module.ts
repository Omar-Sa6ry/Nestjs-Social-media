import { Module } from '@nestjs/common'
import { MessageResolver } from './message.resolver'
import { MessageService } from './message.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './entity/message.entity'
import { RedisModule } from 'src/common/redis/redis.module'
import { UserModule } from '../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { User } from '../users/entity/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    RedisModule,
    UserModule,
    WebSocketModule,
  ],
  providers: [MessageResolver, MessageService],
})
export class MessageModule {}
