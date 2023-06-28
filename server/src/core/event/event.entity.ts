import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Event {
  @Field(() => Int, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
