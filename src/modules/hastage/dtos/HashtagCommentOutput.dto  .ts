import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsDate, IsInt, IsString } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'
import {
  CommentResponse,
  CommentResponsee,
} from 'src/modules/comment/dto/CommentResponse.dto'

@ObjectType()
export class CommentHastageResponse {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field()
  @Field(() => CommentResponsee)
  @Expose()
  comment: CommentResponse

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
