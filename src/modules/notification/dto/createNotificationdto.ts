import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class CreateNotificationDto {
  @Field()
  @IsString()
  content: string

  @Field()
  @IsString()
  userName: string
}
