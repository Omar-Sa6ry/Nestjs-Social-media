import { Field, ObjectType } from '@nestjs/graphql'
import { IsBoolean, IsDate, IsInt } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class NotificationOutput {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsBoolean()
  Isread: boolean

  @Field(() => User)
  sender: User

  @Field(() => User)
  receive: User

  @Field()
  @IsDate()
  createdAt: Date
}
