/* @license Enterprise */

import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup =
  (
    args: FromEntityToFlatEntityArgs<'rowLevelPermissionPredicateGroup'>,
  ): FlatRowLevelPermissionPredicateGroup => {
    const { entity: rowLevelPermissionPredicateGroupEntity } = args;

    const rowLevelPermissionPredicateGroupEntityWithoutRelations =
      fromEntityToScalarEntity({
        metadataName: 'rowLevelPermissionPredicateGroup',
        entity: rowLevelPermissionPredicateGroupEntity,
      });

    const relationUniversalIdentifiers =
      resolveManyToOneRelationIdsToUniversalIdentifiers({
        metadataName: 'rowLevelPermissionPredicateGroup',
        ...args,
      });

    return {
      ...rowLevelPermissionPredicateGroupEntityWithoutRelations,
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
