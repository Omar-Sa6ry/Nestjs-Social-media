import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { join } from 'path'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { AppResolver } from './app.resolver'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/users/users.module'
import { User } from './modules/users/entity/user.entity'
import { Notification } from './modules/notification/entity/notification.entity'
import { Message } from './modules/message/entity/message.entity'
import { Post } from './modules/post/entity/post.entity '
import { Comment } from './modules/comment/entity/comment.entity '
import { NotificationModule } from './modules/notification/notification.module'
import { PostModule } from './modules/post/post.module'
import { MessageModule } from './modules/message/message.module'
import { RedisModule } from './common/redis/redis.module'
import { Image } from './modules/post/entity/image.entity'
import { UploadModule } from './common/upload/upload.module'
import { Mention } from './modules/mention/entity/mention.entity '
import { MentionModule } from './modules/mention/mention.module'
import { LikeModule } from './modules/like/like.module'
import { Like } from './modules/like/entity/like.entity '
import { CommentModule } from './modules/comment/comment.module'
import { ReplyModule } from './modules/reply/reply.module'
import { Reply } from './modules/reply/entity/reply.entity '
import { BlockModule } from './modules/Block/block.module'
import { Block } from './modules/Block/entity/block.entity'
import { RelationModule } from './modules/follow/follow.module'
import { Follow } from './modules/follow/entity/follow.entity'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      uploads: true,
      debug: true,
      playground: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Notification,
          Follow,
          Block,
          Message,
          Post,
          Image,
          Comment,
          Reply,
          Mention,
          Like,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisModule,
    AuthModule,
    UploadModule,
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
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
