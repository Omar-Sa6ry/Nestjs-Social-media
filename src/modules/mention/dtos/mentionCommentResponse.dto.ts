import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
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
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  username: string

  @Field()
  @IsInt()
  @Expose()
  mentionTo: number

  @Field(() => Comment)
  @Expose()
  comment: Comment

  @Field()
  @IsDate()
  @Expose()
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date
}
