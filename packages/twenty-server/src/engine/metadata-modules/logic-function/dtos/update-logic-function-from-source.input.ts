import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@InputType()
class UpdateLogicFunctionFromSourceInputUpdates {
  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @IsNumber()
  @Field({ nullable: true })
  @Min(1)
  @Max(900)
  @IsOptional()
  timeoutSeconds?: number;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  sourceHandlerCode?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  @IsObject()
  @IsOptional()
  toolInputSchema?: object;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  handlerName?: string;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  sourceHandlerPath?: string;

  @IsBoolean()
  @Field({ nullable: true })
  @IsOptional()
  isTool?: boolean;

  @IsBoolean()
  @Field({ nullable: true })
  @IsOptional()
  isBuildUpToDate?: boolean;

  @IsString()
  @Field({ nullable: true })
  @IsOptional()
  checksum?: string;

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

@InputType()
export class UpdateLogicFunctionFromSourceInput {
  @Field(() => UUIDScalarType, {
    description: 'Id of the logic function to update',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Type(() => UpdateLogicFunctionFromSourceInputUpdates)
  @ValidateNested()
  @Field(() => UpdateLogicFunctionFromSourceInputUpdates, {
    description: 'The logic function updates',
  })
  update: UpdateLogicFunctionFromSourceInputUpdates;
}
