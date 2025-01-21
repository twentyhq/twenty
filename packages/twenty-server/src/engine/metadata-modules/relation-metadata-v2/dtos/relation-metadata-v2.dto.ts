import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Authorize,
  BeforeDeleteOne,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { BeforeDeleteOneRelationV2 } from 'src/engine/metadata-modules/relation-metadata-v2/hooks/before-delete-one-relation-v2.hook';
import { RelationMetadataTypeV2 } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.entity';

registerEnumType(RelationMetadataTypeV2, {
  name: 'RelationMetadataTypeV2',
  description: 'Type of the relation',
});

@ObjectType('relationV2DTO')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableFilter: true,
  disableSort: true,
  maxResultsSize: 1000,
})
@BeforeDeleteOne(BeforeDeleteOneRelationV2)
@Relation('fromObjectMetadata', () => ObjectMetadataDTO)
@Relation('toObjectMetadata', () => ObjectMetadataDTO)
export class RelationMetadataV2DTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => RelationMetadataTypeV2)
  relationType: RelationMetadataTypeV2;

  @Field()
  sourceObjectMetadataId: string;

  @Field()
  targetObjectMetadataId: string;

  @Field()
  sourceFieldMetadataId: string;

  @Field()
  targetFieldMetadataId: string;

  @HideField()
  workspaceId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
