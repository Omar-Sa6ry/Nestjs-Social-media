import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsDate, IsInt } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class NotificationOutput {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsBoolean()
  @Expose()
  Isread: boolean

  @Field(() => User)
  @Expose()
  sender: User

  @Field(() => User)
  @Expose()
  receive: User

  @Field()
  @IsDate()
  @Expose()
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date
}
