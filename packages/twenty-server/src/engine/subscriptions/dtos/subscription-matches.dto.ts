import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SubscriptionMatch')
export class SubscriptionMatchDTO {
  @Field(() => [String])
  id: string;
}

@ObjectType('SubscriptionMatches')
export class SubscriptionMatchesDTO {
  @Field(() => [SubscriptionMatchDTO])
  subscriptions: SubscriptionMatchDTO[];
}
