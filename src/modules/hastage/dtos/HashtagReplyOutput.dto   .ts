import { Field, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'
import {
  ReplyResponse,
  ReplyResponsee,
} from 'src/modules/reply/dto/ReplyResponse.dto'

@ObjectType()
export class ReplyHastageResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field()
  @Field(() => ReplyResponsee)
  reply: ReplyResponse

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}
