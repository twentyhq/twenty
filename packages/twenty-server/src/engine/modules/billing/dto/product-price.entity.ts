import { Field, ObjectType } from '@nestjs/graphql';

import Stripe from 'stripe';

@ObjectType()
export class ProductPriceEntity {
  @Field(() => String)
  recurringInterval: Stripe.Price.Recurring.Interval;

  @Field(() => Number)
  unitAmount: number;

  @Field(() => Number)
  created: number;

  @Field(() => String)
  stripePriceId: string;
}
