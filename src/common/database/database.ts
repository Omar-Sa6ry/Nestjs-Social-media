import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Block } from 'src/modules/Block/entity/block.entity'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { Follow } from 'src/modules/follow/entity/follow.entity'
import { Hashtag } from 'src/modules/hastage/entity/hastage.entity'
import { Like } from 'src/modules/like/entity/like.entity '
import { Mention } from 'src/modules/mention/entity/mention.entity '
import { Message } from 'src/modules/message/entity/message.entity'
import { Notification } from 'src/modules/notification/entity/notification.entity'
import { Image } from 'src/modules/post/entity/image.entity'
import { Post } from 'src/modules/post/entity/post.entity '
import { Reply } from 'src/modules/reply/entity/reply.entity'
import { User } from 'src/modules/users/entity/user.entity'

@Module({
  imports: [
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
          Hashtag,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DataBaseModule {}
