import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { DatabaseEventTriggerSettings } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';

@InputType()
export class UpdateDatabaseEventTriggerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  id: string;

  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  settings: DatabaseEventTriggerSettings;
}
