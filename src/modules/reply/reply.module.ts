import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reply } from './entity/reply.entity '
import { Post } from '../post/entity/post.entity '
import { User } from '../users/entity/user.entity'
import { UserModule } from '../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'
import { ReplyService } from './reply.service'
import { ReplyResolver } from './reply.resolver'
import { Comment } from '../comment/entity/comment.entity '

@Module({
  imports: [
    UserModule,
    WebSocketModule,
    TypeOrmModule.forFeature([Post, User, Comment, Reply]),
  ],
  providers: [ReplyResolver, ReplyService],
})
export class ReplyModule {}
