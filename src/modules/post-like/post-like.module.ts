import { Module } from '@nestjs/common'
import { PostLikeResolver } from './post-like.resolver'
import { PostLikeService } from './post-like.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostLike } from './entity/likesPost.entity '
import { Post } from '../post/entity/post.entity '
import { UserModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike]), UserModule],
  providers: [PostLikeResolver, PostLikeService],
  exports: [PostLikeService],
})
export class PostLikeModule {}
