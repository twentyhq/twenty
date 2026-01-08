/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { RowLevelPermissionPredicateOperand } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-operand';
import { RowLevelPermissionPredicateValue } from 'src/engine/metadata-modules/row-level-permission-predicate/types/row-level-permission-predicate-value.type';

registerEnumType(RowLevelPermissionPredicateOperand, {
  name: 'RowLevelPermissionPredicateOperand',
});
@ObjectType('RowLevelPermissionPredicate')
export class RowLevelPermissionPredicateDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  fieldMetadataId: string;

  @Field(() => String)
  objectMetadataId: string;

  @Field(() => RowLevelPermissionPredicateOperand)
  operand: RowLevelPermissionPredicateOperand;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => String, { nullable: true })
  workspaceMemberFieldMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  workspaceMemberSubFieldName?: string | null;

  @Field(() => String, { nullable: true })
  rowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;

  @Field(() => String)
  roleId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value: RowLevelPermissionPredicateValue | null;
}
