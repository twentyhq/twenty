/* @license Enterprise */

import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/row-level-permission-predicate-entity-relation-properties.constant';
import { type RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate =
  (
    rowLevelPermissionPredicateEntity: RowLevelPermissionPredicateEntity,
  ): FlatRowLevelPermissionPredicate => {
    const rowLevelPermissionPredicateEntityWithoutRelations =
      removePropertiesFromRecord(rowLevelPermissionPredicateEntity, [
        ...ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES,
      ] as (typeof ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES)[number][]);

    return {
      ...rowLevelPermissionPredicateEntityWithoutRelations,
      createdAt: rowLevelPermissionPredicateEntity.createdAt.toISOString(),
      updatedAt: rowLevelPermissionPredicateEntity.updatedAt.toISOString(),
      deletedAt:
        rowLevelPermissionPredicateEntity.deletedAt?.toISOString() ?? null,
      universalIdentifier:
        rowLevelPermissionPredicateEntityWithoutRelations.universalIdentifier ??
        rowLevelPermissionPredicateEntityWithoutRelations.id,
    };
  };
