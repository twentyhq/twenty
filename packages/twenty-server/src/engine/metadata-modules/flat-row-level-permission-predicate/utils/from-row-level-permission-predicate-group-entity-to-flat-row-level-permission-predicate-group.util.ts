/* @license Enterprise */

import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/row-level-permission-predicate-group-entity-relation-properties.constant';
import { type RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup =
  (
    rowLevelPermissionPredicateGroupEntity: RowLevelPermissionPredicateGroupEntity,
  ): FlatRowLevelPermissionPredicateGroup => {
    const rowLevelPermissionPredicateGroupEntityWithoutRelations =
      removePropertiesFromRecord(rowLevelPermissionPredicateGroupEntity, [
        ...ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES,
      ] as (typeof ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES)[number][]);

    return {
      ...rowLevelPermissionPredicateGroupEntityWithoutRelations,
      createdAt: rowLevelPermissionPredicateGroupEntity.createdAt.toISOString(),
      updatedAt: rowLevelPermissionPredicateGroupEntity.updatedAt.toISOString(),
      deletedAt:
        rowLevelPermissionPredicateGroupEntity.deletedAt?.toISOString() ?? null,
      universalIdentifier:
        rowLevelPermissionPredicateGroupEntityWithoutRelations.universalIdentifier ??
        rowLevelPermissionPredicateGroupEntityWithoutRelations.id,
      childRowLevelPermissionPredicateGroupIds:
        rowLevelPermissionPredicateGroupEntity.childRowLevelPermissionPredicateGroups.map(
          ({ id }) => id,
        ),
      rowLevelPermissionPredicateIds:
        rowLevelPermissionPredicateGroupEntity.rowLevelPermissionPredicates.map(
          ({ id }) => id,
        ),
    };
  };
