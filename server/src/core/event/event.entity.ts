import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Event {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
