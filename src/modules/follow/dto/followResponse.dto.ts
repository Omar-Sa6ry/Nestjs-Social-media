import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { BaseResponse } from 'src/common/dtos/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class RelationResponseInput {
  @Field(() => User)
  follower: User

  @Field(() => User)
  following: User

  @Field()
  @IsString()
  status: string
}

@ObjectType()
export class RelationResponseOutput extends BaseResponse {
  @Field(() => User)
  @Expose()
  follower: User

  @Field(() => User)
  @Expose()
  following: User

  @Field()
  @IsString()
  @Expose()
  status: string
}

@ObjectType()
export class followsResponse extends BaseResponse {
  @Field(() => [RelationResponseOutput], { nullable: true })
  @Expose()
  items: RelationResponseOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  @Expose()
  pagination?: PaginationInfo
}

@ObjectType()
export class followResponse extends BaseResponse {
  @Field(() => RelationResponseOutput, { nullable: true })
  @Expose()
  data: RelationResponseOutput
}
