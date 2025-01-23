import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationResolver } from './notification.resolver'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notification } from './entity/notification.entity'

@Module({
  imports: [UserModule, RedisModule, TypeOrmModule.forFeature([Notification])],
  providers: [NotificationService, NotificationResolver],
})
export class NotificationModule {}
