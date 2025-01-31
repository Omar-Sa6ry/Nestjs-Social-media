import { Field, InputType } from '@nestjs/graphql'
import { IsBoolean, IsDate, IsInt, IsSemVer } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'

@InputType()
export class messageInput {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsSemVer()
  content: string

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
