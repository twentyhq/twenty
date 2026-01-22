/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import {
  RowLevelPermissionPredicateOperand,
  RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';

@InputType()
export class UpdateRowLevelPermissionPredicateInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  fieldMetadataId?: string;

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
