import { Field, HideField, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { DatabaseEventTriggerSettings } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';

@InputType()
export class CreateDatabaseEventTriggerInput {
  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  settings: DatabaseEventTriggerSettings;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  serverlessFunctionId: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
