import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Authorize,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ServerlessFunctionSyncStatus } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { InputSchema } from 'src/modules/workflow/workflow-builder/types/input-schema.type';

registerEnumType(ServerlessFunctionSyncStatus, {
  name: 'ServerlessFunctionSyncStatus',
  description: 'SyncStatus of the serverlessFunction',
});

@ObjectType('ServerlessFunction')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  maxResultsSize: 1000,
})
export class ServerlessFunctionDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field({ nullable: true })
  description: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  runtime: string;

  @IsNumber()
  @Field()
  timeoutSeconds: number;

  @IsString()
  @Field({ nullable: true })
  latestVersion: string;

  @IsArray()
  @Field(() => [String], { nullable: false })
  publishedVersions: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  latestVersionInputSchema: InputSchema;

  @IsEnum(ServerlessFunctionSyncStatus)
  @IsNotEmpty()
  @Field(() => ServerlessFunctionSyncStatus)
  syncStatus: ServerlessFunctionSyncStatus;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
