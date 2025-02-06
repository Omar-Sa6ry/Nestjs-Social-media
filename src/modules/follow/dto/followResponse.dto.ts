import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
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
