import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('TriggerAddPeopleToMessageListJobInput')
export class TriggerAddPeopleToMessageListJobInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageListId: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  personFilter: Partial<ObjectRecordFilter>;
}
