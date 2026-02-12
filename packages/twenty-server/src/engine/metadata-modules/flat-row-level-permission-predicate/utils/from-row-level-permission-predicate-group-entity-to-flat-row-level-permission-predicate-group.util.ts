/* @license Enterprise */

import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/row-level-permission-predicate-group-entity-relation-properties.constant';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

type FromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroupArgs =
  FromEntityToFlatEntityArgs<'rowLevelPermissionPredicateGroup'> & {
    rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap: Map<
      string,
      string
    >;
  };

export const fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup =
  ({
    entity: rowLevelPermissionPredicateGroupEntity,
    applicationIdToUniversalIdentifierMap,
    objectMetadataIdToUniversalIdentifierMap,
    roleIdToUniversalIdentifierMap,
    rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
  }: FromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroupArgs): FlatRowLevelPermissionPredicateGroup => {
    const rowLevelPermissionPredicateGroupEntityWithoutRelations =
      removePropertiesFromRecord(rowLevelPermissionPredicateGroupEntity, [
        ...ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES,
      ] as (typeof ROW_LEVEL_PERMISSION_PREDICATE_GROUP_ENTITY_RELATION_PROPERTIES)[number][]);

    const applicationUniversalIdentifier =
      applicationIdToUniversalIdentifierMap.get(
        rowLevelPermissionPredicateGroupEntity.applicationId,
      );

    if (!isDefined(applicationUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Application with id ${rowLevelPermissionPredicateGroupEntity.applicationId} not found for rowLevelPermissionPredicateGroup ${rowLevelPermissionPredicateGroupEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const objectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        rowLevelPermissionPredicateGroupEntity.objectMetadataId,
      );

    if (!isDefined(objectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ObjectMetadata with id ${rowLevelPermissionPredicateGroupEntity.objectMetadataId} not found for rowLevelPermissionPredicateGroup ${rowLevelPermissionPredicateGroupEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
      rowLevelPermissionPredicateGroupEntity.roleId,
    );

    if (!isDefined(roleUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Role with id ${rowLevelPermissionPredicateGroupEntity.roleId} not found for rowLevelPermissionPredicateGroup ${rowLevelPermissionPredicateGroupEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    let parentRowLevelPermissionPredicateGroupUniversalIdentifier:
      | string
      | null = null;

    if (
      isDefined(
        rowLevelPermissionPredicateGroupEntity.parentRowLevelPermissionPredicateGroupId,
      )
    ) {
      parentRowLevelPermissionPredicateGroupUniversalIdentifier =
        rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap.get(
          rowLevelPermissionPredicateGroupEntity.parentRowLevelPermissionPredicateGroupId,
        ) ?? null;

      if (
        !isDefined(parentRowLevelPermissionPredicateGroupUniversalIdentifier)
      ) {
        throw new FlatEntityMapsException(
          `RowLevelPermissionPredicateGroup with id ${rowLevelPermissionPredicateGroupEntity.parentRowLevelPermissionPredicateGroupId} not found for rowLevelPermissionPredicateGroup ${rowLevelPermissionPredicateGroupEntity.id}`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }
    }

    return {
      ...rowLevelPermissionPredicateGroupEntityWithoutRelations,
      createdAt: rowLevelPermissionPredicateGroupEntity.createdAt.toISOString(),
      updatedAt: rowLevelPermissionPredicateGroupEntity.updatedAt.toISOString(),
      deletedAt:
        rowLevelPermissionPredicateGroupEntity.deletedAt?.toISOString() ?? null,
      universalIdentifier:
        rowLevelPermissionPredicateGroupEntityWithoutRelations.universalIdentifier,
      childRowLevelPermissionPredicateGroupIds: (
        rowLevelPermissionPredicateGroupEntity.childRowLevelPermissionPredicateGroups ??
        []
      ).map(({ id }) => id),
      rowLevelPermissionPredicateIds: (
        rowLevelPermissionPredicateGroupEntity.rowLevelPermissionPredicates ??
        []
      ).map(({ id }) => id),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      roleUniversalIdentifier,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier,
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
