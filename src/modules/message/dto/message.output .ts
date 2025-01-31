import { Field,  ObjectType } from '@nestjs/graphql'
import { IsBoolean, IsDate, IsInt, IsSemVer } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class MessageOutput{
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
