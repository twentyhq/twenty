import { Field, InputType } from '@nestjs/graphql';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@InputType()
export class SubscriptionInput {
  @Field()
  id: string;

  @Field()
  query: string;

  @Field(() => [DatabaseEventAction], { nullable: true })
  selectedEventActions?: DatabaseEventAction[];
}
