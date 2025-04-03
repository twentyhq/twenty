import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

registerEnumType(DatabaseEventAction, {
  name: 'DatabaseEventAction',
  description: 'Database Event Action',
});

@ObjectType()
export class DbEventDTO {
  @Field(() => DatabaseEventAction)
  action: DatabaseEventAction;

  @Field(() => String)
  objectNameSingular: string;

  @Field(() => GraphQLJSON)
  record: object;

  @Field(() => [String], { nullable: true })
  updatedFields?: string[];
}
