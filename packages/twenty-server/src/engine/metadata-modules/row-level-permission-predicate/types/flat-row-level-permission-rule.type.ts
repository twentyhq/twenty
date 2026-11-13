/* @license Enterprise */

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type RowLevelPermissionRuleEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-rule.entity';

export type FlatRowLevelPermissionRule =
  FlatEntityFrom<RowLevelPermissionRuleEntity>;
