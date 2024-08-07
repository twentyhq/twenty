import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  BeforeDeleteOne,
  CursorConnection,
  FilterableField,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { BeforeDeleteOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-delete-one-object.hook';

@ObjectType('object')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
@BeforeDeleteOne(BeforeDeleteOneObject)
@CursorConnection('fields', () => FieldMetadataDTO)
export class ObjectMetadataDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field()
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
  description: string;

  @Field({ nullable: true })
  icon: string;

  @FilterableField()
  isCustom: boolean;

  @FilterableField()
  isRemote: boolean;

  @FilterableField()
  isActive: boolean;

  @FilterableField()
  isSystem: boolean;

  @FilterableField({ nullable: true })
  softDelete: boolean;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  labelIdentifierFieldMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  imageIdentifierFieldMetadataId?: string | null;
}
