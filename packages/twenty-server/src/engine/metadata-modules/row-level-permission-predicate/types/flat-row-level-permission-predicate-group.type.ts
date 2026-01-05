/* @license Enterprise */

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';

export type FlatRowLevelPermissionPredicateGroup =
  FlatEntityFrom<RowLevelPermissionPredicateGroupEntity>;
