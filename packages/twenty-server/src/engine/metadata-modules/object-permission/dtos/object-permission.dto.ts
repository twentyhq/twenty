import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

@ObjectType('ObjectPermission')
export class ObjectPermissionDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field(() => Boolean, { nullable: true })
  canReadObjectRecords?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canUpdateObjectRecords?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canSoftDeleteObjectRecords?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canDestroyObjectRecords?: boolean | null;

  @Field(() => GraphQLJSON, {
    nullable: true,
    deprecationReason: 'Use unreadableFields and uneditableFields',
  })
  restrictedFields?: Record<
    string,
    { canRead: boolean | null; canUpdate: boolean | null }
  >;

  @Field(() => [UUIDScalarType], { nullable: true })
  unreadableFields?: string[];

  @Field(() => [UUIDScalarType], { nullable: true })
  uneditableFields?: string[];

  @Field(() => [RowLevelPermissionPredicateDTO], { nullable: true })
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateDTO[];

  @Field(() => [RowLevelPermissionPredicateGroupDTO], { nullable: true })
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupDTO[];
}
