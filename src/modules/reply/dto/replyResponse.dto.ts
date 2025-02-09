import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class ReplyInput {
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
export class ReplyOutPut {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field(() => Comment)
  @Expose()
  comment: Comment

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

@ObjectType()
export class ReplysResponse extends BaseResponse {
  @Field(() => [ReplyOutPut], { nullable: true })
  @Expose()
  items: ReplyOutPut[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class ReplyResponse extends BaseResponse {
  @Field(() => ReplyOutPut, { nullable: true })
  @Expose()
  data: ReplyOutPut
}
