import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveQueryFromEventStreamInput {
  @Field()
  eventStreamId: string;

  @Field()
  queryId: string;
}
