/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';

@InputType()
export class CreateRowLevelPermissionPredicateGroupInput {
  @Field(() => String, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => RowLevelPermissionPredicateGroupLogicalOperator)
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;

  @Field(() => String)
  roleId: string;

  @Field(() => String)
  objectMetadataId: string;
}
