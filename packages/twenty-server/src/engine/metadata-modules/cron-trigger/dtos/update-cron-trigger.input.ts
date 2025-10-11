import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsUUID, ValidateNested } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { CronTriggerSettings } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';

@InputType()
class UpdateCronTriggerInputUpdates {
  @IsObject()
  @IsNotEmpty()
  @Field(() => GraphQLJSON)
  settings: CronTriggerSettings;
}

@InputType()
export class UpdateCronTriggerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, {
    description: 'The id of the cron trigger to update',
  })
  id: string;

  @Type(() => UpdateCronTriggerInputUpdates)
  @ValidateNested()
  @Field(() => UpdateCronTriggerInputUpdates, {
    description: 'The cron trigger updates',
  })
  update: UpdateCronTriggerInputUpdates;
}
