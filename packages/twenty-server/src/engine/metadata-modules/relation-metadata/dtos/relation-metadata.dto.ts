import {
  ObjectType,
  ID,
  Field,
  HideField,
  registerEnumType,
} from '@nestjs/graphql';

import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  Authorize,
  BeforeDeleteOne,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BeforeDeleteOneRelation } from 'src/engine/metadata-modules/relation-metadata/hooks/before-delete-one-relation.hook';

registerEnumType(RelationMetadataType, {
  name: 'RelationMetadataType',
  description: 'Type of the relation',
});

@ObjectType('relation')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
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
  @IDField(() => ID)
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
