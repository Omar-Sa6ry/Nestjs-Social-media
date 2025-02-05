import { Field, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { CommentResponse, CommentResponsee } from 'src/modules/comment/dto/CommentResponse.dto'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class CommentHastageResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field()
  @Field(() => CommentResponsee)
  comment: CommentResponse

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}
