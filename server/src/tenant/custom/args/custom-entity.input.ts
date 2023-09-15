import { Field, ID, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CustomEntityInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: Record<string, unknown>;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
