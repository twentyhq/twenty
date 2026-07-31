import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

// Only the identity fields matter here; the tool injects objectMetadataId onto
// groups after this check, so accept the shape before that step.
type PredicateOwnershipInput = {
  id?: string;
  fieldMetadataId: string;
  workspaceMemberFieldMetadataId?: string | null;
  rowLevelPermissionPredicateGroupId?: string | null;
};

type PredicateGroupOwnershipInput = {
  id?: string;
};

// The upsert service resolves supplied ids workspace-wide and the migration
// validators only compare an update against its own stored row, so a predicate
// or group id belonging to another role or object would be silently rewritten
// in place, and a field from another object would build a filter that never
// matches. The model picks these ids, so scope them to the target explicitly.
export const assertRowLevelRuleOwnership = ({
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
  predicates: PredicateOwnershipInput[];
  predicateGroups: PredicateGroupOwnershipInput[];
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
      throw new Error(
        `Predicate group "${predicateGroup.id}" belongs to a different role or object and cannot be modified here. Omit the id to create a new group.`,
      );
    }
  }

  const groupIdsInPayload = new Set(
    predicateGroups.map((predicateGroup) => predicateGroup.id).filter(isDefined),
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
        throw new Error(
          `Predicate "${predicate.id}" belongs to a different role or object and cannot be modified here. Omit the id to create a new predicate.`,
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
        throw new Error(
          `Predicate group "${groupId}" is not a group of this role and object. Reference a group declared in predicateGroups or an existing group of this role and object.`,
        );
      }
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: predicate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      throw new Error(
        `Field "${predicate.fieldMetadataId}" not found. Use the metadata tools to look up field ids.`,
      );
    }

    if (fieldMetadata.objectMetadataId !== objectMetadataId) {
      throw new Error(
        `Field "${fieldMetadata.name}" belongs to another object and cannot be used in a rule on this object. Rules must filter on a field of the object they restrict.`,
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
      throw new Error(
        `workspaceMemberFieldMetadataId "${workspaceMemberFieldMetadataId}" is not a field of the workspaceMember object. The rule would silently never apply.`,
      );
    }
  }
};
