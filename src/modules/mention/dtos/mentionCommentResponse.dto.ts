import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
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

@ObjectType()
export class CommentsMenResponse extends BaseResponse {
  @Field(() => [CommentMentionResponsee], { nullable: true })
  @Expose()
  items: CommentMentionResponsee[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class CommentMenResponse extends BaseResponse {
  @Field(() => CommentMentionResponsee, { nullable: true })
  @Expose()
  data: CommentMentionResponsee
}
