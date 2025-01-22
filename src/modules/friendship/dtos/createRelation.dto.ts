import { Field, InputType } from '@nestjs/graphql'
import { IsInt, IsString } from 'class-validator'

@InputType()
export class CreateRelationDto {
  @Field()
  @IsString()
  userName: string

  @Field(() => String)
  status: string
}
