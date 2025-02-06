import { Field, ObjectType } from '@nestjs/graphql'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsDate, IsInt, IsSemVer } from 'class-validator'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class MessageOutput {
  @Field()
  @IsInt()
  @Expose()
  id: number

  @Field()
  @IsSemVer()
  @Expose()
  content: string

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
