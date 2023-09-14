import { Field, ID, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CustomEntityInput {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => GraphQLJSON, { nullable: false })
  data!: Record<string, unknown>;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;
}
