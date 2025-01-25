import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { Comment } from 'src/modules/comment/entity/comment.entity '

@InputType()
export class CommentMentionResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  username: string

  @Field()
  @IsInt()
  mentionTo: number

  @Field(() => Comment)
  comment: Comment

  @Field()
  @IsDate()
  createdAt: Date
}

@ObjectType()
export class CommentMentionResponsee {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  username: string

  @Field()
  @IsInt()
  mentionTo: number

  @Field(() => Comment)
  comment: Comment

  @Field()
  @IsDate()
  createdAt: Date
}
