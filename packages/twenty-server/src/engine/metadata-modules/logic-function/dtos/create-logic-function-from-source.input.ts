import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
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

  @Field(() => graphqlTypeJson, { nullable: true })
  @IsObject()
  @IsOptional()
  toolInputSchema?: object;

  @IsBoolean()
  @Field({ nullable: true })
  @IsOptional()
  isTool?: boolean;

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
}
