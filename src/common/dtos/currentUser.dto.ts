import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CurrentUserDto {
  @Field()
  email: string

  @Field()
  addressId: number

  @Field()
  id: number

  @Field()
  companyId: number
}
