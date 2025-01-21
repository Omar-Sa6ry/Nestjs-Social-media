import { Module } from '@nestjs/common';
import { CommentMentionResolver } from './comment-mention.resolver';
import { CommentMentionService } from './comment-mention.service';

@Module({
  providers: [CommentMentionResolver, CommentMentionService]
})
export class CommentMentionModule {}
