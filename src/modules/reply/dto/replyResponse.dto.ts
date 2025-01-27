import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class ReplyResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field(() => Comment)
  comment: Comment

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}

@ObjectType()
export class ReplyResponsee {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field(() => Comment)
  comment: Comment

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}

