import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class BlockResponseInput {
  @Field()
  @IsInt()
  id: number

  @Field(() => User)
  follower: User

  @Field(() => User)
  following: User
}

@ObjectType()
export class BlockResponseOutput extends BaseResponse {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field(() => User)
  @Expose()
  follower: User

  @Field(() => User)
  @Expose()
  following: User
}

@ObjectType()
export class BlockResponse extends BaseResponse {
  @Field(() => [BlockResponseOutput], { nullable: true })
  @Expose()
  items: BlockResponseOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}
