import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'
import {
  CommentInput,
  CommentResponsee,
} from 'src/modules/comment/dto/CommentResponse.dto'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'

@ObjectType()
export class CommentHastageOutPut extends BaseResponse {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field()
  @Field(() => CommentResponsee)
  @Expose()
  comment: CommentInput

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
export class CommentHastagesResponse extends BaseResponse {
  @Field(() => [CommentHastageOutPut], { nullable: true })
  @Expose()
  items: CommentHastageOutPut[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class CommentHastageResponse extends BaseResponse {
  @Field(() => CommentHastageOutPut, { nullable: true })
  @Expose()
  data: CommentHastageOutPut
}
