import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { resolveNamedPrincipalIds } from 'src/engine/permissions/principal/utils/resolve-named-principal-ids.util';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type PermissionsRowAccessGrants,
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isObjectOperationDisabled } from 'src/engine/permissions/role/utils/is-object-operation-disabled.util';
import { isObjectOperationPermitted } from 'src/engine/permissions/role/utils/is-object-operation-permitted.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/rls/utils/render-row-level-permission-filter-to-sql.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

export const buildRowAccessPolicy = ({
  subject,
  environment,
  hypotheticalRecordShareAccessLevel,
  tableAlias,
  flatObjectMetadata,
  operationType,
}: RowAccessPolicyContext &
  RowAccessPolicyTarget & {
    hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  }): RowAccessPolicy => {
  if (subject.isSystemContext) {
    return { kind: 'open' };
  }

  if (
    isObjectOperationDisabled({
      objectMetadata: flatObjectMetadata,
      operationType,
    }) &&
    !subject.isOwningApplication(flatObjectMetadata)
  ) {
    return { kind: 'denied' };
  }

  const isGrantedBeyondRole = isOperationGrantedBeyondRole({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
    operationType,
  });
  const isRolePermitting =
    !isDefined(subject.objectsPermissions) ||
    isObjectOperationPermitted({
      objectMetadata: flatObjectMetadata,
      operationType,
      objectsPermissions: subject.objectsPermissions,
    });

  if (!isRolePermitting && !isGrantedBeyondRole) {
    return { kind: 'denied' };
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);
  const hasHypotheticalRecordShare =
    isDefined(hypotheticalRecordShareAccessLevel) &&
    accessLevels.includes(hypotheticalRecordShareAccessLevel);

  if (hasHypotheticalRecordShare && isGrantedBeyondRole) {
    return { kind: 'open' };
  }

  const hasPrivateRecords =
    isNonEmptyArray(accessLevels) &&
    isPrivateRecordEnabled(environment.featureFlagsMap) &&
    !isPermissionStorageObject(flatObjectMetadata) &&
    isDefined(subject.principalIds);
  const areRoleGrantsLimitedToPublicRecords =
    hasPrivateRecords && !hasHypotheticalRecordShare;
  const rowLevelPermissionGrant = isRolePermitting
    ? buildRowLevelPermissionGrant({
        subject,
        environment,
        tableAlias,
        flatObjectMetadata,
      })
    : undefined;
  const isObjectGranted =
    isRolePermitting && !isDefined(rowLevelPermissionGrant);

  if (isObjectGranted && !areRoleGrantsLimitedToPublicRecords) {
    return { kind: 'open' };
  }

  const principalIds = resolveNamedPrincipalIds(subject);
  const isShareGranting =
    isNonEmptyArray(principalIds) &&
    isNonEmptyArray(accessLevels) &&
    (isGrantedBeyondRole || hasPrivateRecords);
  const isCreatorGranting =
    hasPrivateRecords &&
    isDefined(subject.workspaceMemberId) &&
    hasCreatedByField({
      flatObjectMetadata,
      flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    });

  const grants: PermissionsRowAccessGrants = {
    tableAlias,
    flatObjectMetadata,
    areRoleGrantsLimitedToPublicRecords,
    // Without sharing beyond the role, shares and creators only open private records the role filter admits
    areRecordGrantsHeldToRowLevelPermissions: !isGrantedBeyondRole,
    isObjectGranted,
    rowLevelPermissionGrant,
    shareGrant: isShareGranting
      ? {
          principalIds,
          accessLevels,
          isLimitedToPrivateRecords: !isGrantedBeyondRole,
        }
      : undefined,
    creatorGrant:
      isCreatorGranting && isDefined(subject.workspaceMemberId)
        ? { workspaceMemberId: subject.workspaceMemberId }
        : undefined,
  };

  if (
    !grants.isObjectGranted &&
    !isDefined(grants.rowLevelPermissionGrant) &&
    !isDefined(grants.shareGrant) &&
    !isDefined(grants.creatorGrant)
  ) {
    return { kind: 'denied' };
  }

  return { kind: 'gated', grants };
};

const buildRowLevelPermissionGrant = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
}: Pick<RowAccessPolicyContext, 'subject' | 'environment'> &
  Pick<RowAccessPolicyTarget, 'tableAlias' | 'flatObjectMetadata'>):
  | PermissionsRowAccessGrants['rowLevelPermissionGrant']
  | undefined => {
  const recordFilter =
    subject.resolveRowLevelPermissionRecordFilter(flatObjectMetadata);

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  const condition = renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
  });

  // A filter whose predicates all cancel out restricts nothing
  if (condition === null) {
    return undefined;
  }

  return { recordFilter, condition };
};
