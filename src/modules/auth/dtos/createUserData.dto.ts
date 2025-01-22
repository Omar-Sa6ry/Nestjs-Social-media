import { Field, InputType } from '@nestjs/graphql'
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsLowercase,
  Length,
} from 'class-validator'
import {
  EmailUsed,
  PasswordValidator,
  UserNameUsed,
} from 'src/common/constant/messages.constant'

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
  @Length(8, 16, { message: PasswordValidator })
  password: string

  @Field()
  @IsPhoneNumber()
  phone: string
}
