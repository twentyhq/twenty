import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { type RecordOrMetadataGqlOperationSignature } from 'src/engine/subscriptions/types/event-stream-data.type';

@InputType()
export class AddQuerySubscriptionInput {
  @Field()
  eventStreamId: string;

  @Field()
  queryId: string;

  @Field(() => GraphQLJSON)
  operationSignature: RecordOrMetadataGqlOperationSignature;
}
