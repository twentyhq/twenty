import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class QuerySubscriptionInput {
  @Field()
  id: string;

  @Field()
  query: string;
}

