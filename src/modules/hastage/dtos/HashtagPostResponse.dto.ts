import { Field, InputType } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'
import { PostInput } from 'src/modules/post/dto/PostResponse.dto'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class PostHastageResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  content: string

  @Field()
  @Field(() => PostInput)
  post: PostInput

  @Field(() => User)
  user: User

  @Field()
  @IsDate()
  createdAt: Date
}
