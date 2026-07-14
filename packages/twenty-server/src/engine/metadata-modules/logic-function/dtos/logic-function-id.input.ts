import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class LogicFunctionIdInput {
  @Field(() => ID, { description: 'The id of the function.' })
  id!: string;
}
