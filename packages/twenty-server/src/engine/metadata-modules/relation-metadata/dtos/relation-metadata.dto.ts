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
import { BeforeDeleteOneRelation } from 'src/engine/metadata-modules/relation-metadata/hooks/before-delete-one-relation.hook';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

registerEnumType(RelationMetadataType, {
  name: 'RelationMetadataType',
  description: 'Type of the relation',
});

@ObjectType('relation')
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
@BeforeDeleteOne(BeforeDeleteOneRelation)
@Relation('fromObjectMetadata', () => ObjectMetadataDTO)
@Relation('toObjectMetadata', () => ObjectMetadataDTO)
export class RelationMetadataDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => RelationMetadataType)
  relationType: RelationMetadataType;

  @Field()
  fromObjectMetadataId: string;

  @Field()
  toObjectMetadataId: string;

  @Field()
  fromFieldMetadataId: string;

  @Field()
  toFieldMetadataId: string;

  @HideField()
  workspaceId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
