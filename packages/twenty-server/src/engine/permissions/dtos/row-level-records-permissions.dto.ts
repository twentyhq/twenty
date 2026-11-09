import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

@ObjectType('RowLevelRecordsPermissions')
export class RowLevelRecordsPermissionsDTO {
  @Field(() => Boolean)
  canCreateRecords: boolean;

  @Field(() => Boolean)
  canReadRecords: boolean;

  @Field(() => Boolean)
  canUpdateRecords: boolean;

  @Field(() => Boolean)
  canSoftDeleteRecords: boolean;

  @Field(() => Boolean)
  canDestroyRecords: boolean;

  @Field(() => [RowLevelPermissionPredicateDTO])
  predicates: RowLevelPermissionPredicateDTO[];

  @Field(() => [RowLevelPermissionPredicateGroupDTO])
  predicateGroups: RowLevelPermissionPredicateGroupDTO[];

  @Field(() => [UUIDScalarType], { nullable: true })
  unreadableFields?: string[];

  @Field(() => [UUIDScalarType], { nullable: true })
  uneditableFields?: string[];
}
