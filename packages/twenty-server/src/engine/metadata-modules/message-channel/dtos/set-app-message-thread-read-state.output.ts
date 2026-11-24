import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('SetAppMessageThreadReadStateOutput')
export class SetAppMessageThreadReadStateOutput {
  @Field(() => Int)
  updatedMessageCount: number;
}
