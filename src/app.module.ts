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
import { CommentModule } from './modules/comment/comment.module'
import { PostLikeModule } from './modules/post-like/post-like.module'
import { MessageModule } from './modules/message/message.module'
import { RedisModule } from './common/redis/redis.module'
import { RelationModule } from './modules/friendship/relation.module'
import { Relation } from './modules/friendship/entity/relation.entity'
import { Image } from './modules/post/entity/image.entity'
import { PostLike } from './modules/post-like/entity/likesPost.entity '
import { UploadModule } from './modules/upload/upload.module'
import { CommentLike } from './modules/comment-like/entity/likesComment.entity '
import { CommentLikeModule } from './modules/comment-like/comment-like.module'
import { Mention } from './modules/mention/entity/mention.entity '
import { MentionModule } from './modules/mention/mention.module'

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
          Relation,
          Message,
          Post,
          Image,
          PostLike,
          Comment,
          CommentLike,
          Mention,
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
    CommentModule,
    RelationModule,
    CommentLikeModule,
    PostLikeModule,
    MessageModule,
    MentionModule,
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
