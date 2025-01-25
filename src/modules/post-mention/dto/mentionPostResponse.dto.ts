import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { Post } from 'src/modules/post/entity/post.entity '

@InputType()
export class PostMentionResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  username: string

  @Field()
  @IsInt()
  mentionTo: number

  @Field(() => Post)
  post: Post

  @Field()
  @IsDate()
  createdAt: Date
}

@ObjectType()
export class PostMentionResponsee {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  username: string

  @Field()
  @IsInt()
  mentionTo: number

  @Field(() => Post)
  post: Post

  @Field()
  @IsDate()
  createdAt: Date
}
