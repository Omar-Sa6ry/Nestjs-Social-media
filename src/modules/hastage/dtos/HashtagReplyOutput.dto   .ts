import { Field, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'
import {
  ReplyResponse,
  ReplyResponsee,
} from 'src/modules/reply/dto/ReplyResponse.dto'
import { Expose, Transform } from 'class-transformer'

@ObjectType()
export class ReplyHastageResponse {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field()
  @Field(() => ReplyResponsee)
  @Expose()
  reply: ReplyResponse

  @Field(() => User)
  @Expose()
  user: User

  @Field()
  @IsDate()
  @Expose()
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date
}
