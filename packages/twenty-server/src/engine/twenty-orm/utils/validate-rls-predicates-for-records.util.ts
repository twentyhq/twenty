/* @license Enterprise */

import { type ObjectRecord, type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
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
): Record<string, unknown> => {
  const restrictedFields =
    objectRecordsPermissions[objectMetadata.id]?.restrictedFields ?? {};

  return filterPredicateRecursive(filter, restrictedFields);
};

const filterPredicateRecursive = (
  filter: Record<string, unknown>,
  restrictedFields: Record<
    string,
    { canRead?: boolean | null; canUpdate?: boolean | null }
  >,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filter)) {
    if (key === 'and' && Array.isArray(value)) {
      const filtered = value
        .map((item) => filterPredicateRecursive(item, restrictedFields))
        .filter((item) => Object.keys(item).length > 0);

      if (filtered.length > 0) {
        result[key] = filtered;
      }
    } else if (key === 'or' && Array.isArray(value)) {
      const filtered = value
        .map((item) => filterPredicateRecursive(item, restrictedFields))
        .filter((item) => Object.keys(item).length > 0);

      if (filtered.length > 0) {
        result[key] = filtered;
      }
    } else if (key === 'not' && typeof value === 'object' && value !== null) {
      const filtered = filterPredicateRecursive(
        value as Record<string, unknown>,
        restrictedFields,
      );

      if (Object.keys(filtered).length > 0) {
        result[key] = filtered;
      }
    } else {
      // This is a field reference - check if it's editable
      const fieldPermission = restrictedFields[key];
      const isEditable =
        !isDefined(fieldPermission) ||
        fieldPermission.canUpdate !== false;

      if (isEditable) {
        result[key] = value;
      }
    }
  }

  return result;
};
