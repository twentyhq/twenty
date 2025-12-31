/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { RowLevelPermissionPredicateOperand } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-operand';
import { RowLevelPermissionPredicateValue } from 'src/engine/metadata-modules/row-level-permission-predicate/types/row-level-permission-predicate-value.type';

@InputType()
export class UpdateRowLevelPermissionPredicateInput {
  @Field(() => String)
  id: string;

  @Field(() => RowLevelPermissionPredicateOperand, { nullable: true })
  operand?: RowLevelPermissionPredicateOperand;

  @Field(() => GraphQLJSON, { nullable: true })
  value?: RowLevelPermissionPredicateValue;

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
}
