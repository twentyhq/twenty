/* @license Enterprise */

import { Logger } from '@nestjs/common';

import { type DataSource } from 'typeorm';
import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type CompositeFieldSubFieldName,
  type PartialFieldMetadataItemOption,
  type RecordGqlOperationFilter,
  type RowLevelPermissionPredicateValue,
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
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { validateEnumValueCompatibility } from 'src/engine/twenty-orm/utils/validate-enum-value-compatibility.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

type BuildRowLevelPermissionRecordFilterArgs = {
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectMetadata: FlatObjectMetadata;
  roleId: string | undefined;
  authContext: AuthContext;
  flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  objectIdByNameSingular?: Record<string, string>;
  workspaceDataSource?: DataSource;
  workspaceSchemaName?: string;
};

const logger = new Logger('buildRowLevelPermissionRecordFilter');

export const buildRowLevelPermissionRecordFilter = async ({
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  objectMetadata,
  roleId,
  authContext,
  flatObjectMetadataMaps,
  objectIdByNameSingular,
  workspaceDataSource,
  workspaceSchemaName,
}: BuildRowLevelPermissionRecordFilterArgs): Promise<RecordGqlOperationFilter | null> => {
  if (!isDefined(roleId)) {
    return null;
  }

  const predicates = Object.values(
    flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
  )
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

  const workspaceMember = authContext.workspaceMember;

  const recordFilters = (
    await Promise.all(
      predicates.map(async (predicate) => {
        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: predicate.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

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
            findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: workspaceMemberFieldMetadataId,
              flatEntityMaps: flatFieldMetadataMaps,
            });

          if (!isDefined(workspaceMemberFieldMetadata)) {
            throw new PermissionsException(
              `Workspace member field metadata not found for row level predicate ${predicate.id}`,
              PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
            );
          }

          // Determine if this is a direct or indirect relation
          const workspaceMemberObjectId =
            objectIdByNameSingular?.['workspaceMember'];
          const isDirectRelation =
            !workspaceMemberObjectId ||
            workspaceMemberFieldMetadata.objectMetadataId ===
              workspaceMemberObjectId;

          if (isDirectRelation) {
            if (!isDefined(workspaceMember)) {
              return null;
            }

            const rawWorkspaceMemberValue = Object.entries(
              workspaceMember,
            ).find(([key]) => key === workspaceMemberFieldMetadata.name)?.[1];

            const workspaceMemberSubFieldName =
              predicate.workspaceMemberSubFieldName;

            if (
              isDefined(workspaceMemberSubFieldName) &&
              isDefined(rawWorkspaceMemberValue) &&
              isCompositeFieldMetadataType(workspaceMemberFieldMetadata.type) &&
              typeof rawWorkspaceMemberValue === 'object'
            ) {
              predicateValue =
                rawWorkspaceMemberValue[workspaceMemberSubFieldName];
            } else {
              predicateValue = rawWorkspaceMemberValue;
            }

            if (!isDefined(predicateValue)) {
              return null;
            }

            // Validate that workspace member enum value is compatible with target field enum options
            const isEnumValueCompatible = validateEnumValueCompatibility({
              workspaceMemberFieldMetadata,
              targetFieldMetadata: fieldMetadata,
              predicateValue,
            });

            if (!isEnumValueCompatible) {
              return null;
            }

            // When workspace member field is SELECT or MULTI_SELECT and value is a string,
            // wrap it in an array to match the frontend format (which uses multi-select UI)
            if (
              (workspaceMemberFieldMetadata.type === FieldMetadataType.SELECT ||
                workspaceMemberFieldMetadata.type ===
                  FieldMetadataType.MULTI_SELECT) &&
              typeof predicateValue === 'string'
            ) {
              predicateValue = [predicateValue];
            }
          } else {
            // Indirect relation: field is on an intermediate object (e.g., Agent)
            // that has a RELATION to WorkspaceMember
            if (
              !isDefined(workspaceMember) ||
              !isDefined(workspaceDataSource) ||
              !isDefined(workspaceSchemaName) ||
              !isDefined(flatObjectMetadataMaps)
            ) {
              return null;
            }

            // Find the intermediate object metadata
            const intermediateObjectMetadata = Object.values(
              flatObjectMetadataMaps.byUniversalIdentifier,
            )
              .filter(isDefined)
              .find(
                (obj) =>
                  obj.id === workspaceMemberFieldMetadata.objectMetadataId,
              );

            if (!isDefined(intermediateObjectMetadata)) {
              return null;
            }

            const tableName = computeTableName(
              intermediateObjectMetadata.nameSingular,
              intermediateObjectMetadata.isCustom,
            );

            // The FK column is the field name + "Id"
            const fkColumn = `${workspaceMemberFieldMetadata.name}Id`;

            try {
              const rows = await workspaceDataSource.query(
                `SELECT "id" FROM "${workspaceSchemaName}"."${tableName}" WHERE "${fkColumn}" = $1 AND "deletedAt" IS NULL`,
                [workspaceMember.id],
              );

              if (rows.length === 0) {
                logger.warn(
                  `[RLS] No rows found in "${tableName}" for workspace member ${workspaceMember.id} (fkColumn="${fkColumn}", workspace=${authContext.workspace?.id}). Predicate will deny access.`,
                );

                return null;
              }

              predicateValue =
                rows.length === 1
                  ? rows[0].id
                  : rows.map((r: { id: string }) => r.id);
            } catch (error) {
              logger.warn(
                `[RLS] Error resolving indirect relation predicate for workspace member ${workspaceMember.id} (table="${tableName}", fkColumn="${fkColumn}", workspace=${authContext.workspace?.id}): ${error instanceof Error ? error.message : String(error)}`,
              );

              return null;
            }
          }
        }

        const effectiveSubFieldName = predicate.subFieldName as
          | CompositeFieldSubFieldName
          | undefined;

        const filterValue = convertViewFilterValueToString(predicateValue);

        return {
          id: predicate.id,
          fieldMetadataId: predicate.fieldMetadataId,
          value: filterValue,
          type: getFilterTypeFromFieldType(fieldMetadata.type),
          operand: predicate.operand as unknown as RecordFilter['operand'],
          recordFilterGroupId: predicate.rowLevelPermissionPredicateGroupId,
          subFieldName: effectiveSubFieldName,
        } satisfies RecordFilter;
      }),
    )
  ).filter(isDefined);

  // If predicates were defined for this role+object but none could be resolved
  // (e.g., no Agent linked to this workspace member), deny access by returning
  // an impossible filter rather than falling through to "show everything".
  if (recordFilters.length === 0) {
    return {
      id: { eq: '00000000-0000-0000-0000-000000000000' },
    } as RecordGqlOperationFilter;
  }

  const relevantGroupIds = new Set<string>();

  for (const predicate of predicates) {
    if (isDefined(predicate.rowLevelPermissionPredicateGroupId)) {
      relevantGroupIds.add(predicate.rowLevelPermissionPredicateGroupId);

      let parentGroupId = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: predicate.rowLevelPermissionPredicateGroupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      })?.parentRowLevelPermissionPredicateGroupId;

      while (isDefined(parentGroupId) && !relevantGroupIds.has(parentGroupId)) {
        relevantGroupIds.add(parentGroupId);
        parentGroupId = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: parentGroupId,
          flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
        })?.parentRowLevelPermissionPredicateGroupId;
      }
    }
  }

  const recordFilterGroups: RecordFilterGroup[] = [...relevantGroupIds]
    .map((groupId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: groupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      }),
    )
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
    .map((predicate) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: predicate.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
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
