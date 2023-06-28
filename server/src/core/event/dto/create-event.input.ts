import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreateEventInput {
  @Field({ description: 'Type of the event' })
  type: string;

  @Field({ description: 'Event data in JSON format' })
  data: string;
}
