import { Module } from '@nestjs/common';
import { PostMentionResolver } from './post-mention.resolver';
import { PostMentionService } from './post-mention.service';

@Module({
  providers: [PostMentionResolver, PostMentionService]
})
export class PostMentionModule {}
