import { Field, InputType } from '@nestjs/graphql'
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsLowercase,
  Length,
} from 'class-validator'

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  userName: string

  @Field()
  @IsEmail()
  @IsLowercase()
  email: string

  @Field()
  @IsString()
  @Length(8, 16)
  password: string

  @Field()
  @IsPhoneNumber()
  phone: string
}
