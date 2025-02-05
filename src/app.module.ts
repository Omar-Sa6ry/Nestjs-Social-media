import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/users/users.module'
import { PostModule } from './modules/post/post.module'
import { MessageModule } from './modules/message/message.module'
import { MentionModule } from './modules/mention/mention.module'
import { LikeModule } from './modules/like/like.module'
import { CommentModule } from './modules/comment/comment.module'
import { ReplyModule } from './modules/reply/reply.module'
import { BlockModule } from './modules/Block/block.module'
import { RelationModule } from './modules/follow/follow.module'
import { HashtagModule } from './modules/hastage/hashtage.module'
import { GraphqlModule } from './common/graphql/graphql.module'
import { ThrottlerModule } from './common/throttler/throttling.module'
import { DataBaseModule } from './common/database/database'
import { ConfigModule } from './common/config/config.module'
import { AppResolver } from './app.resolver'
import { NotificationModule } from './modules/notification/notification.module'

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    DataBaseModule,
    ThrottlerModule,

    AuthModule,
    UserModule,
    NotificationModule,
    PostModule,
    RelationModule,
    BlockModule,
    LikeModule,
    CommentModule,
    ReplyModule,
    MessageModule,
    MentionModule,
    HashtagModule,
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
