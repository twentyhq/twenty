/* @license Enterprise */

import {
  RecordFilterGroupLogicalOperator,
  type CompositeFieldSubFieldName,
  type PartialFieldMetadataItemOption,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  convertViewFilterValueToString,
  getFilterTypeFromFieldType,
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'src/engine/metadata-modules/row-level-permission-predicate/enums/row-level-permission-predicate-group-logical-operator.enum';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type RowLevelPermissionPredicateValue } from 'src/engine/metadata-modules/row-level-permission-predicate/types/row-level-permission-predicate-value.type';

type BuildRowLevelPermissionRecordFilterArgs = {
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectMetadata: FlatObjectMetadata;
  roleId: string | undefined;
  authContext: AuthContext;
};

export const buildRowLevelPermissionRecordFilter = ({
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  objectMetadata,
  roleId,
  authContext,
}: BuildRowLevelPermissionRecordFilterArgs): RecordGqlOperationFilter | null => {
  if (!isDefined(roleId)) {
    return null;
  }

  const predicates = Object.values(flatRowLevelPermissionPredicateMaps.byId)
    .filter(isDefined)
    .filter(
      (predicate) =>
        predicate.roleId === roleId &&
        predicate.objectMetadataId === objectMetadata.id &&
        !isDefined(predicate.deletedAt),
    );

  if (predicates.length === 0) {
    return null;
  }

  const fieldMetadataMapById = flatFieldMetadataMaps.byId;

  const workspaceMember = authContext.workspaceMember;

  const recordFilters = predicates
    .map((predicate) => {
      const fieldMetadata = fieldMetadataMapById[predicate.fieldMetadataId];

      if (!isDefined(fieldMetadata)) {
        throw new PermissionsException(
          `Field metadata not found for row level predicate ${predicate.id}`,
          PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      const workspaceMemberFieldMetadataId =
        predicate.workspaceMemberFieldMetadataId;
      let predicateValue: RowLevelPermissionPredicateValue = predicate.value;

      if (isDefined(workspaceMemberFieldMetadataId)) {
        const workspaceMemberFieldMetadata =
          fieldMetadataMapById[workspaceMemberFieldMetadataId];

        if (!isDefined(workspaceMemberFieldMetadata)) {
          throw new PermissionsException(
            `Workspace member field metadata not found for row level predicate ${predicate.id}`,
            PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
          );
        }

        if (!isDefined(workspaceMember)) {
          return null;
        }

        const rawWorkspaceMemberValue = Object.entries(workspaceMember).find(
          ([key]) => key === workspaceMemberFieldMetadata.name,
        )?.[1];

        const workspaceMemberSubFieldName =
          predicate.workspaceMemberSubFieldName;

        if (
          isDefined(workspaceMemberSubFieldName) &&
          isDefined(rawWorkspaceMemberValue) &&
          isCompositeFieldMetadataType(workspaceMemberFieldMetadata.type) &&
          typeof rawWorkspaceMemberValue === 'object'
        ) {
          predicateValue = rawWorkspaceMemberValue[workspaceMemberSubFieldName];
        } else {
          predicateValue = rawWorkspaceMemberValue;
        }

        if (!isDefined(predicateValue)) {
          throw new PermissionsException(
            `Workspace member data missing for field ${workspaceMemberFieldMetadata.name}`,
            PermissionsExceptionCode.INVALID_ARG,
          );
        }
      }

      const effectiveSubFieldName = predicate.subFieldName as
        | CompositeFieldSubFieldName
        | undefined;

      return {
        id: predicate.id,
        fieldMetadataId: predicate.fieldMetadataId,
        value: convertViewFilterValueToString(predicateValue),
        type: getFilterTypeFromFieldType(fieldMetadata.type),
        operand: predicate.operand as unknown as RecordFilter['operand'],
        recordFilterGroupId: predicate.rowLevelPermissionPredicateGroupId,
        subFieldName: effectiveSubFieldName,
      } satisfies RecordFilter;
    })
    .filter(isDefined);

  const predicateGroupsById = flatRowLevelPermissionPredicateGroupMaps.byId;

  const relevantGroupIds = new Set<string>();

  for (const predicate of predicates) {
    if (isDefined(predicate.rowLevelPermissionPredicateGroupId)) {
      relevantGroupIds.add(predicate.rowLevelPermissionPredicateGroupId);

      let parentGroupId =
        predicateGroupsById[predicate.rowLevelPermissionPredicateGroupId]
          ?.parentRowLevelPermissionPredicateGroupId;

      while (isDefined(parentGroupId) && !relevantGroupIds.has(parentGroupId)) {
        relevantGroupIds.add(parentGroupId);
        parentGroupId =
          predicateGroupsById[parentGroupId]
            ?.parentRowLevelPermissionPredicateGroupId;
      }
    }
  }

  const recordFilterGroups: RecordFilterGroup[] = [...relevantGroupIds]
    .map((groupId) => predicateGroupsById[groupId])
    .filter(isDefined)
    .filter(
      (predicateGroup) =>
        predicateGroup.roleId === roleId &&
        !isDefined(predicateGroup.deletedAt),
    )
    .map((predicateGroup) => ({
      id: predicateGroup.id,
      logicalOperator:
        predicateGroup.logicalOperator ===
        RowLevelPermissionPredicateGroupLogicalOperator.OR
          ? RecordFilterGroupLogicalOperator.OR
          : RecordFilterGroupLogicalOperator.AND,
      parentRecordFilterGroupId:
        predicateGroup.parentRowLevelPermissionPredicateGroupId,
    }));

  const fieldMetadataItems = predicates
    .map((predicate) => fieldMetadataMapById[predicate.fieldMetadataId])
    .filter(isDefined)
    .map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      options: field.options as PartialFieldMetadataItemOption[],
    }));

  return computeRecordGqlOperationFilter({
    recordFilters,
    recordFilterGroups,
    fields: fieldMetadataItems,
    filterValueDependencies: {
      currentWorkspaceMemberId: authContext.workspaceMemberId,
    },
  });
};
