import { Module } from '@nestjs/common'
import { UserModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from '../post/entity/post.entity '
import { User } from '../users/entity/user.entity'
import { Hashtag } from './entity/hastage.entity'
import { HashtagService } from './hastage.service'
import { Comment } from '../comment/entity/comment.entity '
import { Image } from '../post/entity/image.entity'
import { LikeModule } from '../like/like.module'
import { Like } from '../like/entity/like.entity '
import { PostLoader } from './loader/post.loader'
import { Reply } from '../reply/entity/reply.entity'
import { ReplyLoader } from './loader/reply.loader '
import { HashtagResolver } from './hashtage.resolver'
import { CommentLoader } from './loader/comment.loader '

@Module({
  imports: [
    UserModule,
    LikeModule,
    TypeOrmModule.forFeature([
      Hashtag,
      Comment,
      Reply,
      Like,
      User,
      Post,
      Image,
    ]),
  ],
  providers: [
    HashtagResolver,
    HashtagService,
    PostLoader,
    CommentLoader,
    ReplyLoader,
  ],
})
export class HashtagModule {}
