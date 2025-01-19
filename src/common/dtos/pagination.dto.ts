import { InputType, Field, Int } from '@nestjs/graphql'

@InputType()
export class PaginationDto {
  @Field(() => Int, { nullable: true })
  limit?: number

  @Field(() => Int, { nullable: true })
  offset?: number
}
