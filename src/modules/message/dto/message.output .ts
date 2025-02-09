import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsDate, IsInt, IsOptional, IsSemVer } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class MessageOutput {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsSemVer()
  @Expose()
  content: string

  @Field()
  @IsBoolean()
  @Expose()
  Isread: boolean

  @Field(() => User)
  @Expose()
  sender: User

  @Field(() => User)
  @Expose()
  receive: User

  @Field()
  @IsDate()
  @Expose()
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date
}

@ObjectType()
export class MessagesResponse extends BaseResponse {
  @Field(() => [MessageOutput], { nullable: true })
  @Expose()
  items: MessageOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class MessageResponse extends BaseResponse {
  @Field(() => MessageOutput, { nullable: true })
  @Expose()
  data: MessageOutput
}
