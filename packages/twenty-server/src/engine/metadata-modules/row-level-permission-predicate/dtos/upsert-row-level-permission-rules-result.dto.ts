/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { RowLevelPermissionRuleDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-rule.dto';

@ObjectType('UpsertRowLevelPermissionRulesResult')
export class UpsertRowLevelPermissionRulesResultDTO {
  @Field(() => [RowLevelPermissionRuleDTO])
  rules: RowLevelPermissionRuleDTO[];

  @Field(() => [RowLevelPermissionPredicateDTO])
  predicates: RowLevelPermissionPredicateDTO[];

  @Field(() => [RowLevelPermissionPredicateGroupDTO])
  predicateGroups: RowLevelPermissionPredicateGroupDTO[];
}
