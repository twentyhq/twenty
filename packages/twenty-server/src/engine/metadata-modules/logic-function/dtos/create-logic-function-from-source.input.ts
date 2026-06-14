import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
  ToolTriggerSettings,
  WorkflowActionTriggerSettings,
} from 'twenty-shared/application';

import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { LogicFunctionSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-source.input';

@InputType()
export class CreateLogicFunctionFromSourceInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsNumber()
  @Field({ nullable: true })
  @Min(1)
  @Max(900)
  @IsOptional()
  timeoutSeconds?: number;

  @IsObject()
  @Field(() => graphqlTypeJson, { nullable: true })
  @IsOptional()
  source?: JsonbProperty<LogicFunctionSourceInput>;

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

  @IsObject()
  @Field(() => graphqlTypeJson, { nullable: true })
  @IsOptional()
  toolTriggerSettings?: JsonbProperty<ToolTriggerSettings>;

  @IsObject()
  @Field(() => graphqlTypeJson, { nullable: true })
  @IsOptional()
  workflowActionTriggerSettings?: JsonbProperty<WorkflowActionTriggerSettings>;
}
