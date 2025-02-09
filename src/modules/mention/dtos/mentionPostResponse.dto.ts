import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsDate, IsInt, IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Post } from 'src/modules/post/entity/post.entity '
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class PostMentionResponse {
  @Field()
  @IsInt()
  id: number

  @Field(() => User)
  mentionFrom: User

  @Field(() => User)
  mentionTo: User

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
  @Expose()
  id: number

  @Field(() => User)
  @Expose()
  mentionFrom: User

  @Field(() => User)
  @Expose()
  mentionTo: User

  @Field(() => Post)
  @Expose()
  post: Post

  @Field()
  @IsDate()
  @Expose()
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date
}

@ObjectType()
export class PostsMenResponse extends BaseResponse {
  @Field(() => [PostMentionResponsee], { nullable: true })
  @Expose()
  items: PostMentionResponsee[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class PostMenResponse extends BaseResponse {
  @Field(() => PostMentionResponsee, { nullable: true })
  @Expose()
  data: PostMentionResponsee
}
