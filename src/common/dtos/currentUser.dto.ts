import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CurrentUserDto {
  @Field()
  id: number
}
