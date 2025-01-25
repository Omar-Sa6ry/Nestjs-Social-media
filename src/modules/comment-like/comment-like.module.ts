import { Module } from '@nestjs/common'
import { UserModule } from '../users/users.module'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from '../comment/entity/comment.entity '
import { CommentLike } from './entity/likesComment.entity '
import { CommentLikeResolver } from './comment-like.resolver'
import { CommentLikeService } from './comment-like.service'

@Module({
  imports: [
    UserModule,
    RedisModule,
    TypeOrmModule.forFeature([CommentLike, Comment]),
  ],
  providers: [CommentLikeResolver, CommentLikeService],
})
export class CommentLikeModule {}
