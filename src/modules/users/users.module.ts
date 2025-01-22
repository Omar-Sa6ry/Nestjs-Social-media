import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { UserResolver } from './users.resolver'
import { QueueModule } from 'src/common/queue/queue.module'
import { UploadService } from 'src/common/queue/services/upload.service'
import { RedisModule } from 'src/common/redis/redis.module'
// import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [TypeOrmModule.forFeature([User]), QueueModule, RedisModule],
  providers: [UserService, UserResolver, UploadService],
  exports: [UserService],
})
export class UserModule {}
