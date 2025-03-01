import { Module } from '@nestjs/common'
import { CommentResolver } from './comment.resolver'
import { CommentService } from './comment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from './entity/comment.entity '
import { Post } from '../post/entity/post.entity '
import { User } from '../users/entity/user.entity'
import { UserModule } from '../users/users.module'
import { WebSocketModule } from 'src/common/websocket/websocket.module'

@Module({
  imports: [
    UserModule,
    WebSocketModule,
    TypeOrmModule.forFeature([Post, User, Comment]),
  ],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}
