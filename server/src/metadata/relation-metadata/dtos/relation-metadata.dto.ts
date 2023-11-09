import { ObjectType, ID, Field, HideField } from '@nestjs/graphql';

import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  Authorize,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadataDTO } from 'src/metadata/object-metadata/dtos/object-metadata.dto';

export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

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
@Relation('fromObjectMetadata', () => ObjectMetadataDTO)
@Relation('toObjectMetadata', () => ObjectMetadataDTO)
export class RelationMetadataDTO {
  @IDField(() => ID)
  id: string;

  @Field()
  relationType: RelationType;

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
