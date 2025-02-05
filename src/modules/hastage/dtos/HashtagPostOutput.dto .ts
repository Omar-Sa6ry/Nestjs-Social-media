import { Field,  ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { PostResponse, PostResponsee } from 'src/modules/post/dto/PostResponse.dto'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class PostHastageResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field()
  @Field(() => PostResponsee)
  post: PostResponse

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}


