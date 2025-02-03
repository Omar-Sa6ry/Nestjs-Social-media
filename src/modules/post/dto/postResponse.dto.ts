import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class PostResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field(() => User)
  user: User

  @Field()
  likes: number

  @Field(() => [Comment], { nullable: true })
  comments: Comment[]

  @Field(() => [String])
  images: string[]

  @Field()
  @IsDate()
  createdAt: Date
}

@ObjectType()
export class PostResponsee {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field(() => User)
  user: User

  @Field()
  likes: number

  @Field(() => [Comment], { nullable: true })
  comments: Comment[]

  @Field(() => [String])
  images: string[]

  @Field()
  @IsDate()
  createdAt: Date
}
