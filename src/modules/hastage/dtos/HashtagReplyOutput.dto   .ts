import { Field, ObjectType } from '@nestjs/graphql'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'
import {
  ReplyResponse,
  ReplyResponsee,
} from 'src/modules/reply/dto/ReplyResponse.dto'
import { Expose, Transform } from 'class-transformer'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'

@ObjectType()
export class ReplyHastageOutPut {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsString()
  @Expose()
  content: string

  @Field()
  @Field(() => ReplyResponsee)
  @Expose()
  reply: ReplyResponse

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
export class ReplyHastagesResponse extends BaseResponse {
  @Field(() => [ReplyHastageOutPut], { nullable: true })
  @Expose()
  items: ReplyHastageOutPut[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class ReplyHastageResponse extends BaseResponse {
  @Field(() => ReplyHastageOutPut, { nullable: true })
  @Expose()
  data: ReplyHastageOutPut
}
