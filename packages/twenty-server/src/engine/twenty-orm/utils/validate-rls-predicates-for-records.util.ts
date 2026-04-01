/* @license Enterprise */

import { type ObjectRecord, type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';

type ValidateRLSPredicatesForRecordsArgs<T extends ObjectLiteral> = {
  records: T[];
  objectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: WorkspaceAuthContext;
  shouldBypassPermissionChecks: boolean;
  objectRecordsPermissions?: ObjectsPermissions;
  isInsertOperation?: boolean;
  errorMessage?: string;
};

export const validateRLSPredicatesForRecords = <T extends ObjectLiteral>({
  records,
  objectMetadata,
  internalContext,
  authContext,
  shouldBypassPermissionChecks,
  objectRecordsPermissions,
  isInsertOperation = false,
  errorMessage = 'Record does not satisfy row-level security constraints of your current role',
}: ValidateRLSPredicatesForRecordsArgs<T>): void => {
  if (shouldBypassPermissionChecks) {
    return;
  }

  const userWorkspaceId = isUserAuthContext(authContext)
    ? authContext.userWorkspaceId
    : undefined;
  const roleId = userWorkspaceId
    ? internalContext.userWorkspaceRoleMap[userWorkspaceId]
    : undefined;

  if (!roleId) {
    return;
  }

  // For insert operations, build a filtered record filter that excludes non-editable fields
  let recordFilter = buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps:
      internalContext.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      internalContext.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    objectMetadata,
    roleId,
    workspaceMember: isUserAuthContext(authContext)
      ? authContext.workspaceMember
      : undefined,
  });

  if (!recordFilter || Object.keys(recordFilter).length === 0) {
    return;
  }

  // For insert operations, filter out RLS predicates on non-editable fields
  if (isInsertOperation && isDefined(objectRecordsPermissions)) {
    recordFilter = filterOutNonEditableFieldPredicates(
      recordFilter,
      objectMetadata,
      objectRecordsPermissions,
      internalContext.flatFieldMetadataMaps,
    );

    if (!recordFilter || Object.keys(recordFilter).length === 0) {
      return;
    }
  }

  for (const record of records) {
    const matchesRLS = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: record as unknown as ObjectRecord,
      filter: recordFilter,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    });

    if (!matchesRLS) {
      throw new TwentyORMException(
        errorMessage,
        TwentyORMExceptionCode.RLS_VALIDATION_FAILED,
      );
    }
  }
};

/**
 * Filters out RLS predicates that reference non-editable fields.
 * During insert, non-editable fields use system defaults, so users
 * should not be penalized if those defaults don't match permissions.
 */
const filterOutNonEditableFieldPredicates = (
  filter: Record<string, unknown>,
  objectMetadata: FlatObjectMetadata,
  objectRecordsPermissions: ObjectsPermissions,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): Record<string, unknown> => {
  const restrictedFields =
    objectRecordsPermissions[objectMetadata.id]?.restrictedFields ?? {};

  // Build a mapping of field names to fieldMetadataIds
  const fieldNameToMetadataIdMap = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).reduce(
    (map, field) => {
      if (isDefined(field)) {
        map[field.name] = field.id;
      }
      return map;
    },
    {} as Record<string, string>,
  );

  return filterPredicateRecursive(
    filter,
    restrictedFields,
    fieldNameToMetadataIdMap,
  );
};

const filterPredicateRecursive = (
  filter: Record<string, unknown>,
  restrictedFields: Record<
    string,
    { canRead?: boolean | null; canUpdate?: boolean | null }
  >,
  fieldNameToMetadataIdMap: Record<string, string>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filter)) {
    if (key === 'and' && Array.isArray(value)) {
      const filtered = value
        .map((item) =>
          filterPredicateRecursive(item, restrictedFields, fieldNameToMetadataIdMap),
        )
        .filter((item) => Object.keys(item).length > 0);

      if (filtered.length > 0) {
        result[key] = filtered;
      }
    } else if (key === 'or' && Array.isArray(value)) {
      const filtered = value
        .map((item) =>
          filterPredicateRecursive(item, restrictedFields, fieldNameToMetadataIdMap),
        )
        .filter((item) => Object.keys(item).length > 0);

      if (filtered.length > 0) {
        result[key] = filtered;
      }
    } else if (key === 'not' && typeof value === 'object' && value !== null) {
      const filtered = filterPredicateRecursive(
        value as Record<string, unknown>,
        restrictedFields,
        fieldNameToMetadataIdMap,
      );

      if (Object.keys(filtered).length > 0) {
        result[key] = filtered;
      }
    } else {
      // This is a field reference - check if it's editable
      // Key is a field name (e.g., "owner", "companyId")
      // We need to look up the fieldMetadataId for this field name
      const fieldMetadataId = fieldNameToMetadataIdMap[key];

      if (!isDefined(fieldMetadataId)) {
        // Field not found in metadata - keep the predicate (could be a system field)
        result[key] = value;
      } else {
        // Look up the field permissions using the fieldMetadataId
        const fieldPermission = restrictedFields[fieldMetadataId];
        const isEditable =
          !isDefined(fieldPermission) || fieldPermission.canUpdate !== false;

        if (isEditable) {
          result[key] = value;
        }
        // If not editable, skip this predicate (don't add to result)
      }
    }
  }

  return result;
};
