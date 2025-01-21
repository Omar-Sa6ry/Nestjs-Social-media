import { Field, InputType } from '@nestjs/graphql'
import { FileUpload } from './fileUpload'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { IsOptional } from 'class-validator'

@InputType()
export class CreateImagDto {
  @IsOptional()
  @Field(() => String)
  name: string

  @IsOptional()
  @Field(() => String)
  breed: string

  @Field(() => GraphQLUpload)
  image: Promise<FileUpload>
}
