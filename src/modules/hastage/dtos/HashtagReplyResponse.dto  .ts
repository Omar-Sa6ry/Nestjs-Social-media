import { Field, InputType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { ReplyInput } from 'src/modules/reply/dto/ReplyResponse.dto'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class ReplyHastageResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field()
  @Field(() => ReplyInput)
  reply: ReplyInput

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}
