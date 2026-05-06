import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
  ToolTriggerSettings,
  WorkflowActionTriggerSettings,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('LogicFunction')
@Authorize({
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  maxResultsSize: 1000,
})
export class LogicFunctionDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  runtime: string;

  @IsNumber()
  @Field()
  timeoutSeconds: number;

  @IsString()
  @Field()
  sourceHandlerPath: string;

  @IsString()
  @Field()
  handlerName: string;

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  cronTriggerSettings?: CronTriggerSettings;

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  databaseEventTriggerSettings?: DatabaseEventTriggerSettings;

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  httpRouteTriggerSettings?: HttpRouteTriggerSettings;

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  toolTriggerSettings?: ToolTriggerSettings;

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  workflowActionTriggerSettings?: WorkflowActionTriggerSettings;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
