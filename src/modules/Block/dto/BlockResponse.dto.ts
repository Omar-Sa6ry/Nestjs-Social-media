import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { IsInt } from 'class-validator'
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
export class BlockResponseOutput {
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
