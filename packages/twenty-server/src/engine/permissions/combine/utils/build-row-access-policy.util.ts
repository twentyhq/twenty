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

  // An insert has no record yet, so privacy cannot apply to it
  const hasPrivateRecords =
    isNonEmptyArray(accessLevels) &&
    isPrivateRecordEnabled(environment.featureFlagsMap) &&
    !isPermissionStorageObject(flatObjectMetadata) &&
    isDefined(subject.principalIds);
  // A hypothetical share reaches the record whatever its privacy
  const areRoleGrantsLimitedToPublicRecords =
    hasPrivateRecords && !hasHypotheticalRecordShare;
  const rlsGrant = isRolePermitting
    ? buildRlsGrant({ subject, environment, tableAlias, flatObjectMetadata })
    : undefined;
  const objectGrant = isRolePermitting && !isDefined(rlsGrant);

  if (objectGrant && !areRoleGrantsLimitedToPublicRecords) {
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
    objectGrant,
    rlsGrant,
    shareGrant: isShareGranting
      ? {
          principalIds,
          accessLevels,
          // Without sharing beyond the role, shares only open private records the role would otherwise see
          isLimitedToPrivateRecords: !isGrantedBeyondRole,
        }
      : undefined,
    creatorGrant:
      isCreatorGranting && isDefined(subject.workspaceMemberId)
        ? { workspaceMemberId: subject.workspaceMemberId }
        : undefined,
  };

  if (
    !grants.objectGrant &&
    !isDefined(grants.rlsGrant) &&
    !isDefined(grants.shareGrant) &&
    !isDefined(grants.creatorGrant)
  ) {
    return { kind: 'denied' };
  }

  return { kind: 'gated', grants };
};

const buildRlsGrant = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
}: RowAccessPolicyContext &
  Pick<RowAccessPolicyTarget, 'tableAlias' | 'flatObjectMetadata'>):
  | PermissionsRowAccessGrants['rlsGrant']
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
