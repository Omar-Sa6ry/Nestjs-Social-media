import { Field, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  @Expose()
  user: User

  @Field()
  @Expose()
  token: string
}
