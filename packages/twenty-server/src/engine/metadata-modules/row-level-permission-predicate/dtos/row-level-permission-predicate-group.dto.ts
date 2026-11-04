/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';

registerEnumType(RowLevelPermissionPredicateGroupLogicalOperator, {
  name: 'RowLevelPermissionPredicateGroupLogicalOperator',
});
@ObjectType('RowLevelPermissionPredicateGroup')
export class RowLevelPermissionPredicateGroupDTO {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => RowLevelPermissionPredicateGroupLogicalOperator)
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;

  @Field(() => Boolean)
  canReadRecords: boolean;

  @Field(() => Boolean)
  canUpdateRecords: boolean;

  @Field(() => Boolean)
  canSoftDeleteRecords: boolean;

  @Field(() => Boolean)
  canDestroyRecords: boolean;

  @Field(() => String)
  roleId: string;

  @Field(() => String)
  objectMetadataId: string;
}
