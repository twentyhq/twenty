import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@InputType()
export class AddQuerySubscriptionInput {
  @Field()
  eventStreamId: string;

  @Field()
  queryId: string;

  @Field(() => GraphQLJSON)
  operationSignature: Record<string, unknown>;
}
