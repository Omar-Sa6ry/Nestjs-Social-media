import { Module } from '@nestjs/common'
import { PostLikeResolver } from './post-like.resolver'
import { PostLikeService } from './post-like.service'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostLike } from './entity/likesPost.entity '
import { Post } from '../post/entity/post.entity '

@Module({
  imports: [
    UserModule,
    RedisModule,
    TypeOrmModule.forFeature([Post, PostLike]),
  ],
  providers: [PostLikeResolver, PostLikeService],
})
export class PostLikeModule {}
