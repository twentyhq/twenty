import { Field, HideField, InputType } from '@nestjs/graphql';

import { IsObject, IsOptional, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'twenty-shared/application';

import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { CreateDefaultLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-default-logic-function.input';

@InputType()
export class CreateLogicFunctionInput extends CreateDefaultLogicFunctionInput {
  @HideField()
  checksum: string;

  @IsString()
  @Field({ nullable: false })
  handlerName: string;

  @IsString()
  @Field({ nullable: false })
  sourceHandlerPath: string;

  @IsString()
  @Field({ nullable: false })
  builtHandlerPath: string;

  @IsObject()
  @Field(() => graphqlTypeJson, { nullable: true })
  @IsOptional()
  cronTriggerSettings?: JsonbProperty<CronTriggerSettings>;

  @IsObject()
  @Field(() => graphqlTypeJson, { nullable: true })
  @IsOptional()
  databaseEventTriggerSettings?: JsonbProperty<DatabaseEventTriggerSettings>;

  @IsObject()
  @Field(() => graphqlTypeJson, { nullable: true })
  @IsOptional()
  httpRouteTriggerSettings?: JsonbProperty<HttpRouteTriggerSettings>;
}
