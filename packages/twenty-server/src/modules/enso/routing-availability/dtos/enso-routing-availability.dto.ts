import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EnsoRoutingAvailability')
export class EnsoRoutingAvailabilityDTO {
  @Field(() => Boolean)
  isAvailableForRouting: boolean;
}
