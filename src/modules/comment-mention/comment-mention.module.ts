import { Module } from '@nestjs/common'
import { UserModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentMention } from './entity/comment.mention.entity '
import { CommentMentionService } from './comment-mention.service'
import { CommentMentionResolver } from './comment-mention.resolver'
import { Comment } from '../comment/entity/comment.entity '

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Comment, CommentMention])],
  providers: [CommentMentionResolver, CommentMentionService],
})
export class CommentMentionModule {}
