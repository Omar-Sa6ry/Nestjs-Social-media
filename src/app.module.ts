// import { CacheModule, CacheStore } from '@nestjs/cache-manager'
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
import { Friendship } from './modules/friendship/entity/friendship.entity'
import { Message } from './modules/message/entity/message.entity'
import { Post } from './modules/post/entity/post.entity '
import { Mention_Post } from './modules/post-mention/entity/mentionPost.entity '
import { Comment } from './modules/comment/entity/comment.entity '
import { Like_Comment } from './modules/comment-like/entity/likesComment.entity  '
import { Like_Post } from './modules/post-like/entity/likesPost.entity '
import { Mention_Comment } from './modules/comment-mention/entity/mentionComment.entity  '
import { NotificationModule } from './modules/notification/notification.module'
import { PostModule } from './modules/post/post.module'
import { CommentModule } from './modules/comment/comment.module'
import { FriendshipModule } from './modules/friendship/friendship.module'
import { CommentLikeModule } from './modules/comment-like/comment-like.module'
import { PostLikeModule } from './modules/post-like/post-like.module'
import { MessageModule } from './modules/message/message.module'
import { CommentMentionModule } from './modules/comment-mention/comment-mention.module'
import { PostMentionModule } from './modules/post-mention/post-mention.module'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async () => {
    //     const store = await redisStore({
    //       socket: {
    //         host: 'localhost',
    //         port: 6379,
    //       },
    //     })

    //     return {
    //       store: store as unknown as CacheStore,
    //       ttl: 3 * 60000,
    //     }
    //   },
    // }),
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
          Friendship,
          Message,
          Post,
          Like_Post,
          Mention_Post,
          Comment,
          Like_Comment,
          Mention_Comment,
        ],
        synchronize: true,
        logging: true,
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
    AuthModule,
    UserModule,
    NotificationModule,
    PostModule,
    CommentModule,
    FriendshipModule,
    CommentLikeModule,
    PostLikeModule,
    MessageModule,
    CommentMentionModule,
    PostMentionModule, TypeOrmModule.forFeature([User]),
  ],

  providers: [AppService, AppResolver,]
})
export class AppModule {}
