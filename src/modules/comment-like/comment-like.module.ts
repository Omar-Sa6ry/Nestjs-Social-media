import { Module } from '@nestjs/common';
import { CommentLikeResolver } from './comment-like.resolver';
import { CommentLikeService } from './comment-like.service';

@Module({
  providers: [CommentLikeResolver, CommentLikeService]
})
export class CommentLikeModule {}
