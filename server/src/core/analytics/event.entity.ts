import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Event {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
