import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationResolver } from './notification.resolver'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notification } from './entity/notification.entity'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { User } from '../users/entity/user.entity'
import { firebaseAdminProvider } from './firebase'

@Module({
  imports: [
    UserModule,
    WebSocketModule,
    RedisModule,
    TypeOrmModule.forFeature([Notification, User]),
  ],
  providers: [NotificationService, NotificationResolver, firebaseAdminProvider],
})
export class NotificationModule {}
