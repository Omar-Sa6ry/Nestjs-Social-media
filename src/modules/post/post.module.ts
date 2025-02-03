import { Module } from '@nestjs/common'
import { PostResolver } from './post.resolver'
import { PostService } from './post.service'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from './entity/post.entity '
import { Image } from './entity/image.entity'
import { QueueModule } from 'src/common/queue/queue.module'
import { UploadModule } from '../../common/upload/upload.module'
import { User } from '../users/entity/user.entity'
import { Comment } from '../comment/entity/comment.entity '
import { UploadService } from '../../common/upload/upload.service'
import { LikeModule } from '../like/like.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'

@Module({
  imports: [
    UserModule,
    UploadModule,
    QueueModule,
    RedisModule,
    LikeModule,
    WebSocketModule,
    TypeOrmModule.forFeature([Post, Comment, User, Image]),
  ],
  providers: [PostResolver, PostService, UploadService],
})
export class PostModule {}
