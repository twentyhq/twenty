import { Field, ObjectType } from '@nestjs/graphql';

import { OnDbEventDTO } from './on-db-event.dto';

@ObjectType('SubscriptionMatch')
export class SubscriptionMatchDTO {
  @Field(() => [String])
  subscriptionIds: string[];

  @Field(() => OnDbEventDTO)
  event: OnDbEventDTO;
}

@ObjectType('SubscriptionMatches')
export class SubscriptionMatchesDTO {
  @Field(() => [SubscriptionMatchDTO])
  matches: SubscriptionMatchDTO[];
}
