import { Field, ID, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class CustomEntity {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => GraphQLJSON, { nullable: false })
  data!: Record<string, unknown>;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;
}
