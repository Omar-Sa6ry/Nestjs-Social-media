import { Field, InputType, ObjectType } from '@nestjs/graphql'
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
  id: number

  @Field(() => User)
  follower: User

  @Field(() => User)
  following: User
}
