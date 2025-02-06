import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsDate, IsInt, IsString } from 'class-validator'
import {
  PostResponse,
  PostResponsee,
} from 'src/modules/post/dto/PostResponse.dto'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class PostHastageResponse {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field()
  @Field(() => PostResponsee)
  @Expose()
  post: PostResponse

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
