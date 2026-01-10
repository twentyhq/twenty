import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImportProgressResultDTO {
  @Field(() => Int)
  remainingMessages: number;
}
