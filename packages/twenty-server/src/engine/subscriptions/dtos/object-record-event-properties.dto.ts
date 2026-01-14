import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('ObjectRecordEventProperties')
export class ObjectRecordEventPropertiesDTO {
  @Field(() => [String], { nullable: true })
  updatedFields?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  before?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  after?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  diff?: object;
}
