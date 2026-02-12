import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type RecordGqlOperationSignature } from 'twenty-shared/types';

@InputType()
export class AddQuerySubscriptionInput {
  @Field()
  eventStreamId: string;

  @Field()
  queryId: string;

  @Field(() => GraphQLJSON)
  operationSignature: RecordGqlOperationSignature;
}
