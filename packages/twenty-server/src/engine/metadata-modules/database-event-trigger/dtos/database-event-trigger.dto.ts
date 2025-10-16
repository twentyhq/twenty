import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsDateString, IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { DatabaseEventTriggerSettings } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';

@ObjectType('DatabaseEventTrigger')
export class DatabaseEventTriggerDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsObject()
  @Field(() => GraphQLJSON)
  settings: DatabaseEventTriggerSettings;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
