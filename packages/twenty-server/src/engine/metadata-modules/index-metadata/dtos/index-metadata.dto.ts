import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Authorize,
  FilterableField,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';

registerEnumType(IndexType, {
  name: 'IndexType',
  description: 'Type of the index',
});

// TODO: drop these nestjs-query decorators once ObjectMetadataDTO's
// @CursorConnection('indexMetadatas') relation is migrated off nestjs-query.
@ObjectType('Index')
@Authorize({
  // oxlint-disable-next-line typescript/no-explicit-any
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
export class IndexMetadataDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  name: string;

  @IsBoolean()
  @IsOptional()
  @FilterableField({ nullable: true })
  isCustom?: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  isUnique: boolean;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  indexWhereClause?: string;

  @IsEnum(IndexType)
  @IsNotEmpty()
  @Field(() => IndexType)
  indexType: IndexType;

  objectMetadataId: string;

  @IsDate()
  @Field()
  createdAt: Date;

  @IsDate()
  @Field()
  updatedAt: Date;

  @HideField()
  workspaceId: string;
}
