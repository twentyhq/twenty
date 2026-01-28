import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsArray,
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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';

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
  @Field({ nullable: true })
  latestVersion?: string;

  @IsString()
  @Field()
  sourceHandlerPath: string;

  @IsString()
  @Field()
  builtHandlerPath: string;

  @IsString()
  @Field()
  handlerName: string;

  @IsArray()
  @Field(() => [String], { nullable: false })
  publishedVersions: string[];

  @IsObject()
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  toolInputSchema?: object;

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
