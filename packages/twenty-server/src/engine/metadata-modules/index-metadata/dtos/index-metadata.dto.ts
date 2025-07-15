import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Authorize,
  CursorConnection,
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
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

registerEnumType(IndexType, {
  name: 'IndexType',
  description: 'Type of the index',
});

@ObjectType('Index')
@Authorize({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
@CursorConnection('objectMetadata', () => ObjectMetadataDTO)
@CursorConnection('indexFieldMetadatas', () => IndexFieldMetadataDTO)
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
