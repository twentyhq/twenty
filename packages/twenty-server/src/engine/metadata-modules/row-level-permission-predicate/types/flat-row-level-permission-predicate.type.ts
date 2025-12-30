/* @license Enterprise */

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';

export type FlatRowLevelPermissionPredicate =
  FlatEntityFrom<RowLevelPermissionPredicateEntity>;
