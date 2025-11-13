import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { ObjectRecord } from 'twenty-shared/types';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

registerEnumType(DatabaseEventAction, {
  name: 'DatabaseEventAction',
  description: 'Database Event Action',
});

@ObjectType('OnDbEvent')
export class OnDbEventDTO {
  @Field(() => DatabaseEventAction)
  action: DatabaseEventAction;

  @Field(() => String)
  objectNameSingular: string;

  @Field()
  eventDate: Date;

  @Field(() => GraphQLJSON)
  record: ObjectRecord;

  @Field(() => [String], { nullable: true })
  updatedFields?: string[];
}
