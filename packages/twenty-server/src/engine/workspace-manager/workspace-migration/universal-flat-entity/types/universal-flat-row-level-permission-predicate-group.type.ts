import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRowLevelPermissionPredicateGroup =
  UniversalFlatEntityFrom<
    RowLevelPermissionPredicateGroupEntity,
    'rowLevelPermissionPredicateGroup'
  >;
