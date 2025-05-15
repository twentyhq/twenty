import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  FilterableField,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';
import { IsDateString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

import { IndexMetadataDTO } from './index-metadata.dto';

@ObjectType('IndexField')
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
@Relation('indexMetadata', () => IndexMetadataDTO, {
  nullable: true,
})
@Relation('fieldMetadata', () => FieldMetadataDTO, {
  nullable: true,
})
export class IndexFieldMetadataDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  indexMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @FilterableField(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsNumber()
  @IsNotEmpty()
  @Field()
  order: number;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @HideField()
  workspaceId: string;
}
