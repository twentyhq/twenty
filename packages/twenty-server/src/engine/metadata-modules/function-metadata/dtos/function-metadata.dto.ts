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
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FunctionSyncStatus } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';

registerEnumType(FunctionSyncStatus, {
  name: 'FunctionSyncStatus',
  description: 'SyncStatus of the function',
});

@ObjectType('function')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  maxResultsSize: 1000,
})
export class FunctionMetadataDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  sourceCodePath: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  buildSourcePath: string;

  @IsEnum(FunctionSyncStatus)
  @IsNotEmpty()
  @Field(() => FunctionSyncStatus)
  syncStatus: FunctionSyncStatus;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
