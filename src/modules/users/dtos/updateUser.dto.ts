import { Field, InputType } from '@nestjs/graphql'
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
} from 'class-validator'
import { CreateImagDto } from 'src/modules/upload/dtos/createImage.dto'

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string

  @Field({ nullable: true })
  @IsOptional()
  avatar?: CreateImagDto

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  addressId?: number
}
