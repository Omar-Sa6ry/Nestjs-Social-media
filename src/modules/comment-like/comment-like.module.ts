import { Module } from '@nestjs/common'
import { UserModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from '../comment/entity/comment.entity '
import { CommentLike } from './entity/likesComment.entity '
import { CommentLikeResolver } from './comment-like.resolver'
import { CommentLikeService } from './comment-like.service'

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([CommentLike, Comment]),
  ],
  providers: [CommentLikeResolver, CommentLikeService],
})
export class CommentLikeModule {}
