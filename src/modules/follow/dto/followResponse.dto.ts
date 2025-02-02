import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { IsString } from 'class-validator'
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
export class RelationResponseOutput {
  @Field(() => User)
  follower: User

  @Field(() => User)
  following: User

  @Field()
  @IsString()
  status: string
}
