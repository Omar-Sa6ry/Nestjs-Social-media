import { Module } from '@nestjs/common'
import { UserModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from '../post/entity/post.entity '
import { Mention } from './entity/mention.entity '
import { Comment } from '../comment/entity/comment.entity '
import { MentionService } from './mention.service'
import { MentionResolver } from './mention.resolver'
import { User } from '../users/entity/user.entity'

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Post, User, Comment, Mention]),
  ],
  providers: [MentionResolver, MentionService],
})
export class MentionModule {}
