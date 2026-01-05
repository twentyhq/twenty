/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { RowLevelPermissionPredicateGroupLogicalOperator } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-group-logical-operator.enum';

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

  @Field(() => String)
  roleId: string;
}
