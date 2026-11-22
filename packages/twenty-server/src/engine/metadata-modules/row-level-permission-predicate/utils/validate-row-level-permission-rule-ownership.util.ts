/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';
import { type FlattenedRowLevelPermissionRuleInputs } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flattened-row-level-permission-rule-inputs.type';

const getRuleFieldObjectMetadataIdOrThrow = ({
  relationFieldMetadataId,
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  relationFieldMetadataId: string | null | undefined;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string => {
  if (!isDefined(relationFieldMetadataId)) {
    return objectMetadataId;
  }

  const relationTargetObjectMetadataId = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  })?.relationTargetObjectMetadataId;

  if (!isDefined(relationTargetObjectMetadataId)) {
    throw new RowLevelPermissionPredicateException(
      'relationFieldMetadataId does not point to a relation field. A rule can only reach another object through a relation.',
      RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
    );
  }

  return relationTargetObjectMetadataId;
};

const findExpectedWorkspaceMemberFieldObjectMetadataId = ({
  workspaceMemberRelationFieldMetadataId,
  workspaceMemberObjectMetadataId,
  flatFieldMetadataMaps,
}: {
  workspaceMemberRelationFieldMetadataId: string | null | undefined;
  workspaceMemberObjectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string | null | undefined => {
  if (!isDefined(workspaceMemberRelationFieldMetadataId)) {
    return workspaceMemberObjectMetadataId;
  }

  const workspaceMemberRelationFieldMetadata =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceMemberRelationFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  return workspaceMemberRelationFieldMetadata?.objectMetadataId ===
    workspaceMemberObjectMetadataId
    ? workspaceMemberRelationFieldMetadata.relationTargetObjectMetadataId
    : undefined;
};

// Ids resolve workspace-wide downstream and migration validators only compare an update to its own row, so another
// role's or object's ids would be silently rewritten and another object's field would build a never-matching filter
export const validateRowLevelPermissionRuleOwnershipOrThrow = ({
  roleId,
  objectMetadataId,
  rules,
  predicates,
  predicateGroups,
  flatRowLevelPermissionRuleMaps,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  workspaceMemberObjectMetadataId,
}: FlattenedRowLevelPermissionRuleInputs & {
  roleId: string;
  objectMetadataId: string;
  flatRowLevelPermissionRuleMaps: FlatEntityMaps<FlatRowLevelPermissionRule>;
  flatRowLevelPermissionPredicateMaps: FlatEntityMaps<FlatRowLevelPermissionPredicate>;
  flatRowLevelPermissionPredicateGroupMaps: FlatEntityMaps<FlatRowLevelPermissionPredicateGroup>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceMemberObjectMetadataId?: string;
}): void => {
  for (const rule of rules) {
    const existingRule = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: rule.id,
      flatEntityMaps: flatRowLevelPermissionRuleMaps,
    });

    if (
      isDefined(existingRule) &&
      (existingRule.roleId !== roleId ||
        existingRule.objectMetadataId !== objectMetadataId)
    ) {
      throw new RowLevelPermissionPredicateException(
        'Rule belongs to a different role or object and cannot be modified here. Omit the id to create a new rule.',
        RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_OBJECT_MODIFICATION,
      );
    }
  }

  for (const predicateGroup of predicateGroups) {
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

  for (const predicate of predicates) {
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

    const expectedFieldObjectMetadataId = getRuleFieldObjectMetadataIdOrThrow({
      relationFieldMetadataId: predicate.relationFieldMetadataId,
      objectMetadataId,
      flatFieldMetadataMaps,
    });

    if (fieldMetadata.objectMetadataId !== expectedFieldObjectMetadataId) {
      throw new RowLevelPermissionPredicateException(
        'Field belongs to another object and cannot be used in a rule on this object. Rules must filter on a field of the object they restrict, or of the object reached by their relation field.',
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
    const expectedWorkspaceMemberFieldObjectMetadataId =
      findExpectedWorkspaceMemberFieldObjectMetadataId({
        workspaceMemberRelationFieldMetadataId:
          predicate.workspaceMemberRelationFieldMetadataId,
        workspaceMemberObjectMetadataId,
        flatFieldMetadataMaps,
      });

    if (
      !isDefined(workspaceMemberFieldMetadata) ||
      !isDefined(expectedWorkspaceMemberFieldObjectMetadataId) ||
      workspaceMemberFieldMetadata.objectMetadataId !==
        expectedWorkspaceMemberFieldObjectMetadataId
    ) {
      throw new RowLevelPermissionPredicateException(
        'workspaceMemberFieldMetadataId is not a field of the workspaceMember object, or of the object its relation reaches. The rule would silently never apply.',
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }
  }
};
