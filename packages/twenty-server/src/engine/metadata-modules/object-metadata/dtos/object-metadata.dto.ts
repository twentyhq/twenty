import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  BeforeDeleteOne,
  CursorConnection,
  FilterableField,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';

import { WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { BeforeDeleteOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-delete-one-object.hook';

@ObjectType('Object')
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
@BeforeDeleteOne(BeforeDeleteOneObject)
@CursorConnection('fields', () => FieldMetadataDTO)
@CursorConnection('indexMetadatas', () => IndexMetadataDTO)
export class ObjectMetadataDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  dataSourceId: string;

  @Field()
  nameSingular: string;

  @Field()
  namePlural: string;

  @Field()
  labelSingular: string;

  @Field()
  labelPlural: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => ObjectStandardOverridesDTO, { nullable: true })
  standardOverrides?: ObjectStandardOverridesDTO;

  @Field({ nullable: true })
  shortcut?: string;

  @FilterableField()
  isCustom: boolean;

  @FilterableField()
  isRemote: boolean;

  @FilterableField()
  isActive: boolean;

  @FilterableField()
  isSystem: boolean;

  @FilterableField()
  isSearchable: boolean;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => UUIDScalarType, { nullable: true })
  labelIdentifierFieldMetadataId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  imageIdentifierFieldMetadataId?: string | null;

  @Field()
  isLabelSyncedWithName: boolean;

  @Field(() => [[String]], { nullable: true })
  duplicateCriteria?: WorkspaceEntityDuplicateCriteria[];
}
