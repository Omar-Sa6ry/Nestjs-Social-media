import { Field, InputType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { CommentResponse } from 'src/modules/comment/dto/CommentResponse.dto'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class CommentHastageResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field()
  @Field(() => CommentResponse)
  comment: CommentResponse

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}
