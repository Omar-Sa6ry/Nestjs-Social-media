import { UploadService } from 'src/common/queue/services/upload.service'
import { Module } from '@nestjs/common'
import { PostResolver } from './post.resolver'
import { PostService } from './post.service'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from './entity/post.entity '
import { Image } from './entity/image.entity'
import { QueueModule } from 'src/common/queue/queue.module'

@Module({
  imports: [
    UserModule,
    QueueModule,
    RedisModule,
    TypeOrmModule.forFeature([Post, Image]),
  ],
  providers: [PostResolver, PostService, UploadService],
})
export class PostModule {}
