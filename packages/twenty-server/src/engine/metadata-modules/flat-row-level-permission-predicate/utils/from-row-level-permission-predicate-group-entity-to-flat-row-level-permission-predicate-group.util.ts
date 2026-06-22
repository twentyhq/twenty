/* @license Enterprise */

import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/row-level-permission-predicate-group-entity-relation-properties.constant';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup =
  (
    args: FromEntityToFlatEntityArgs<'rowLevelPermissionPredicateGroup'>,
  ): FlatRowLevelPermissionPredicateGroup => {
    const { entity: rowLevelPermissionPredicateGroupEntity } = args;

    const rowLevelPermissionPredicateGroupEntityWithoutRelations =
      removePropertiesFromRecord(rowLevelPermissionPredicateGroupEntity, [
        ...ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES,
      ] as (typeof ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES)[number][]);

    const relationUniversalIdentifiers =
      resolveManyToOneRelationIdsToUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicateGroup',
        ...args,
      });

    return {
      ...rowLevelPermissionPredicateGroupEntityWithoutRelations,
      createdAt: rowLevelPermissionPredicateGroupEntity.createdAt.toISOString(),
      updatedAt: rowLevelPermissionPredicateGroupEntity.updatedAt.toISOString(),
      deletedAt:
        rowLevelPermissionPredicateGroupEntity.deletedAt?.toISOString() ?? null,
      universalIdentifier:
        rowLevelPermissionPredicateGroupEntityWithoutRelations.universalIdentifier,
      ...relationUniversalIdentifiers,
      childRowLevelPermissionPredicateGroupIds: (
        rowLevelPermissionPredicateGroupEntity.childRowLevelPermissionPredicateGroups ??
        []
      ).map(({ id }) => id),
      rowLevelPermissionPredicateIds: (
        rowLevelPermissionPredicateGroupEntity.rowLevelPermissionPredicates ??
        []
      ).map(({ id }) => id),
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: (
        rowLevelPermissionPredicateGroupEntity.childRowLevelPermissionPredicateGroups ??
        []
      ).map(({ universalIdentifier }) => universalIdentifier),
      rowLevelPermissionPredicateUniversalIdentifiers: (
        rowLevelPermissionPredicateGroupEntity.rowLevelPermissionPredicates ??
        []
      ).map(({ universalIdentifier }) => universalIdentifier),
    };
  };
