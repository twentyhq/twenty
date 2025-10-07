import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsUUID, ValidateNested } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { DatabaseEventTriggerSettings } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';

@InputType()
class UpdateDatabaseEventTriggerInputUpdates {
  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  settings: DatabaseEventTriggerSettings;
}

@InputType()
export class UpdateDatabaseEventTriggerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field({
    description: 'The id of the database event trigger to update',
  })
  id: string;

  @Type(() => UpdateDatabaseEventTriggerInputUpdates)
  @ValidateNested()
  @Field(() => UpdateDatabaseEventTriggerInputUpdates, {
    description: 'The database event trigger updates',
  })
  update: UpdateDatabaseEventTriggerInputUpdates;
}
