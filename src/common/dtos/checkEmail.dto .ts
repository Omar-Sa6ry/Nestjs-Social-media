import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsLowercase } from 'class-validator'

@InputType()
export class CheckEmail {
  @Field()
  @IsEmail()
  @IsLowercase()
  email: string
}
