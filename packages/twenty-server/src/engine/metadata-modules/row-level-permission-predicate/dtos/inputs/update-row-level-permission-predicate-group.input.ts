/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';

@InputType()
export class UpdateRowLevelPermissionPredicateGroupInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => RowLevelPermissionPredicateGroupLogicalOperator, {
    nullable: true,
  })
  logicalOperator?: RowLevelPermissionPredicateGroupLogicalOperator;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;
}
