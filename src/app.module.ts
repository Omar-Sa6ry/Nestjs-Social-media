// import { CacheModule, CacheStore } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { redisStore } from 'cache-manager-redis-yet'
import { ThrottlerModule } from '@nestjs/throttler'
import { join } from 'path'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { AppResolver } from './app.resolver'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/users/users.module'
import { UploadModule } from './modules/upload/upload.module'
import { User } from './modules/users/entity/user.entity'
import { Notification } from './entities/notification.entity'
import { Friendship } from './entities/friendship.entity'
import { Message } from './entities/message.entity'
import { Post } from './entities/post.entity '
import { Mention_Post } from './entities/mentionPost.entity '
import { Comment } from './entities/comment.entity '
import { Like_Comment } from './entities/likesComment.entity  '
import { Like_Post } from './entities/likesPost.entity '
import { Mention_Comment } from './entities/mentionComment.entity  '

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
    UploadModule,
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
