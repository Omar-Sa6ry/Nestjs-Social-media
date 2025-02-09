import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsDate, IsInt, IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class NotificationOutput {
  @Field()
  @IsInt()
  @Expose()
  id: number

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
export class NotificationsResponse extends BaseResponse {
  @Field(() => [NotificationOutput], { nullable: true })
  @Expose()
  items: NotificationOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class NotificationResponse extends BaseResponse {
  @Field(() => NotificationOutput, { nullable: true })
  @Expose()
  data: NotificationOutput
}
