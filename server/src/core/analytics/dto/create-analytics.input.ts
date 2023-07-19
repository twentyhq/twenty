import { ArgsType, Field } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

@ArgsType()
export class CreateAnalyticsInput {
  @Field({ description: 'Type of the event' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @Field(() => GraphQLJSON, { description: 'Event data in JSON format' })
  @IsObject()
  data: JSON;
}
