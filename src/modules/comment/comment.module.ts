import { Module } from '@nestjs/common'
import { CommentResolver } from './comment.resolver'
import { CommentService } from './comment.service'
import { RedisModule } from 'src/common/redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from './entity/comment.entity '
import { Post } from '../post/entity/post.entity '
import { User } from '../users/entity/user.entity'
import { UserModule } from '../users/users.module'

@Module({
  imports: [
    RedisModule,
    UserModule,
    TypeOrmModule.forFeature([Post, User, Comment]),
  ],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}
