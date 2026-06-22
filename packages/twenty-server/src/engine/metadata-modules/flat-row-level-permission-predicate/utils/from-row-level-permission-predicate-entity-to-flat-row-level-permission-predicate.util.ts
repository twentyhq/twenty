/* @license Enterprise */

import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/row-level-permission-predicate-entity-relation-properties.constant';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate =
  (
    args: FromEntityToFlatEntityArgs<'rowLevelPermissionPredicate'>,
  ): FlatRowLevelPermissionPredicate => {
    const { entity: rowLevelPermissionPredicateEntity } = args;

    const rowLevelPermissionPredicateEntityWithoutRelations =
      removePropertiesFromRecord(rowLevelPermissionPredicateEntity, [
        ...ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES,
      ] as (typeof ROW_LEVEL_PERMISSION_PREDICATE_ENTITY_RELATION_PROPERTIES)[number][]);

    const relationUniversalIdentifiers =
      resolveManyToOneRelationIdsToUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicate',
        ...args,
      });

    return {
      ...rowLevelPermissionPredicateEntityWithoutRelations,
      createdAt: rowLevelPermissionPredicateEntity.createdAt.toISOString(),
      updatedAt: rowLevelPermissionPredicateEntity.updatedAt.toISOString(),
      deletedAt:
        rowLevelPermissionPredicateEntity.deletedAt?.toISOString() ?? null,
      universalIdentifier:
        rowLevelPermissionPredicateEntityWithoutRelations.universalIdentifier,
      ...relationUniversalIdentifiers,
    };
  };
