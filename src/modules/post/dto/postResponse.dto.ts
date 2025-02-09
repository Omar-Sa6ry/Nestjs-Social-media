import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { Expose, Transform } from 'class-transformer'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { BaseResponse } from 'src/common/dtos/BaseResponse'

@InputType()
export class PostInput {
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
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field(() => User)
  @Expose()
  user: User

  @Field()
  @Expose()
  likes: number

  @Field(() => [Comment], { nullable: true })
  @Expose()
  comments: Comment[]

  @Field(() => [String])
  @Expose()
  images: string[]

  @Field()
  @IsDate()
  @Expose()
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date
}

@ObjectType()
export class PostsResponse extends BaseResponse {
  @Field(() => [PostResponsee], { nullable: true })
  @Expose()
  items: PostResponsee[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class PostResponse extends BaseResponse {
  @Field(() => PostResponsee, { nullable: true })
  @Expose()
  data: PostResponsee
}
