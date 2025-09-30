import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { CronTriggerSettings } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';

@InputType()
export class UpdateCronTriggerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String)
  id: string;

  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  settings: CronTriggerSettings;
}
