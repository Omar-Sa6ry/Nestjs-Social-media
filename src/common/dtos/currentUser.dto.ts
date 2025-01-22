import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CurrentUserDto {
  @Field()
  email: string

  @Field()
  id: number
}
