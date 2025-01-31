import { Field, InputType } from '@nestjs/graphql'
import { IsBoolean, IsDate, IsInt } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class NotificationInput {
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
