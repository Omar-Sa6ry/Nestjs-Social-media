import { Module } from '@nestjs/common';
import { PostLikeResolver } from './post-like.resolver';
import { PostLikeService } from './post-like.service';

@Module({
  providers: [PostLikeResolver, PostLikeService]
})
export class PostLikeModule {}
