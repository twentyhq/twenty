import { Field, HideField, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { CronTriggerSettings } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';

@InputType()
export class CreateCronTriggerInput {
  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  settings: CronTriggerSettings;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  serverlessFunctionId: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
