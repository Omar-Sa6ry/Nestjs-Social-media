import { Module } from '@nestjs/common'
import { PostMentionResolver } from './post-mention.resolver'
import { PostMentionService } from './post-mention.service'
import { UserModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from '../post/entity/post.entity '
import { PostMention } from './entity/mentionPost.entity '

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Post, PostMention])],
  providers: [PostMentionResolver, PostMentionService],
})
export class PostMentionModule {}
