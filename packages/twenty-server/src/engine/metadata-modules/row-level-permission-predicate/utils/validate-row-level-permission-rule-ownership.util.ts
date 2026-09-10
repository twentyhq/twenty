/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type RowLevelPermissionPredicateGroupInput,
  type RowLevelPermissionPredicateInput,
} from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

// Supplied ids are resolved workspace-wide further down, and the migration
// validators only compare an update against its own stored row, so a predicate
// or group id belonging to another role or object would be silently rewritten
// in place, and a field from another object would build a filter that never
// matches. Scope everything to the requested role and object upfront.
export const validateRowLevelPermissionRuleOwnershipOrThrow = ({
  roleId,
  objectMetadataId,
  predicates,
  predicateGroups,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  workspaceMemberObjectMetadataId,
}: {
  roleId: string;
  objectMetadataId: string;
  predicates: RowLevelPermissionPredicateInput[];
  predicateGroups: RowLevelPermissionPredicateGroupInput[];
  flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
  flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceMemberObjectMetadataId?: string;
}): void => {
  for (const predicateGroup of predicateGroups) {
    if (!isDefined(predicateGroup.id)) {
      continue;
    }

    const existingGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: predicateGroup.id,
      flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
    });

    if (
      isDefined(existingGroup) &&
      existingGroup.deletedAt === null &&
      (existingGroup.roleId !== roleId ||
        existingGroup.objectMetadataId !== objectMetadataId)
    ) {
      throw new RowLevelPermissionPredicateException(
        'Predicate group belongs to a different role or object and cannot be modified here. Omit the id to create a new group.',
        RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_OBJECT_MODIFICATION,
      );
    }
  }

  const groupIdsInPayload = new Set(
    predicateGroups
      .map((predicateGroup) => predicateGroup.id)
      .filter(isDefined),
  );

  for (const predicate of predicates) {
    if (isDefined(predicate.id)) {
      const existingPredicate = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: predicate.id,
        flatEntityMaps: flatRowLevelPermissionPredicateMaps,
      });

      if (
        isDefined(existingPredicate) &&
        existingPredicate.deletedAt === null &&
        (existingPredicate.roleId !== roleId ||
          existingPredicate.objectMetadataId !== objectMetadataId)
      ) {
        throw new RowLevelPermissionPredicateException(
          'Predicate belongs to a different role or object and cannot be modified here. Omit the id to create a new predicate.',
          RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_ROLE_MODIFICATION,
        );
      }
    }

    const groupId = predicate.rowLevelPermissionPredicateGroupId;

    if (isDefined(groupId) && !groupIdsInPayload.has(groupId)) {
      const referencedGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: groupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      });

      if (
        !isDefined(referencedGroup) ||
        referencedGroup.deletedAt !== null ||
        referencedGroup.roleId !== roleId ||
        referencedGroup.objectMetadataId !== objectMetadataId
      ) {
        throw new RowLevelPermissionPredicateException(
          'Referenced predicate group is not a group of this role and object. Reference a group declared in predicateGroups or an existing group of this role and object.',
          RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        );
      }
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: predicate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      throw new RowLevelPermissionPredicateException(
        'Field metadata not found',
        RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    if (fieldMetadata.objectMetadataId !== objectMetadataId) {
      throw new RowLevelPermissionPredicateException(
        'Field belongs to another object and cannot be used in a rule on this object. Rules must filter on a field of the object they restrict.',
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }

    const workspaceMemberFieldMetadataId =
      predicate.workspaceMemberFieldMetadataId;

    if (
      !isDefined(workspaceMemberFieldMetadataId) ||
      !isDefined(workspaceMemberObjectMetadataId)
    ) {
      continue;
    }

    const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceMemberFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(workspaceMemberFieldMetadata) ||
      workspaceMemberFieldMetadata.objectMetadataId !==
        workspaceMemberObjectMetadataId
    ) {
      throw new RowLevelPermissionPredicateException(
        'workspaceMemberFieldMetadataId is not a field of the workspaceMember object. The rule would silently never apply.',
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }
  }
};
