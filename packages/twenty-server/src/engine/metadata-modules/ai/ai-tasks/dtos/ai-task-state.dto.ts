import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

// The projection travels as JSON validated against the shared contract, so
// the task card and the server read one versioned shape.
@ObjectType('AiTaskState')
export class AiTaskStateDTO {
  @Field(() => String)
  requestedId: string;

  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  task: Record<string, unknown> | null;
}
