import { ArgsType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ArgsType()
export class CreateEventInput {
  @Field({ description: 'Type of the event' })
  type: string;

  @Field(() => GraphQLJSON, { description: 'Event data in JSON format' })
  data: JSON;
}
