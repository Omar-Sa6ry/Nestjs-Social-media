import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User

  @Field()
  token: string
}