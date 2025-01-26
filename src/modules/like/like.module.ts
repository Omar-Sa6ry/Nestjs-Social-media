import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from '../post/entity/post.entity '
import { UserModule } from '../users/users.module'
import { Comment } from '../comment/entity/comment.entity '
import { User } from '../users/entity/user.entity'
import { Like } from './entity/like.entity '
import { LikeService } from './like.service'
import { LikeResolver } from './like.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, User, Like]), UserModule],
  providers: [LikeResolver, LikeService],
  exports: [LikeService],
})
export class LikeModule {}
