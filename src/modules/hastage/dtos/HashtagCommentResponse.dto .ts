import { Field, InputType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { CommentInput } from 'src/modules/comment/dto/CommentResponse.dto'
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
  @Field(() => CommentInput)
  comment: CommentInput

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}
