import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsBoolean,
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
} from 'twenty-shared/application';

import type { InputJsonSchema } from 'twenty-shared/logic-function';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('LogicFunction')
@Authorize({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  toolInputSchema?: InputJsonSchema;

  @IsBoolean()
  @Field()
  isTool: boolean;

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
