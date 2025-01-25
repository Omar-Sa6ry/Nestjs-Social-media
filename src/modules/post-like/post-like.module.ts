import { Module } from '@nestjs/common'
import { PostLikeResolver } from './post-like.resolver'
import { PostLikeService } from './post-like.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostLike } from './entity/likesPost.entity '
import { Post } from '../post/entity/post.entity '
import { UserModule } from '../users/users.module'
import { CommentModule } from '../comment/comment.module'
import { Comment } from '../comment/entity/comment.entity '
import { User } from '../users/entity/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, User, PostLike]),
    UserModule,
  ],
  providers: [PostLikeResolver, PostLikeService],
  exports: [PostLikeService],
})
export class PostLikeModule {}
