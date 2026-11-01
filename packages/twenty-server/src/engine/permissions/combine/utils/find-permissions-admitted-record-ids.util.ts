/* @license Enterprise */

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { findPermissionsCreatorAdmittedRecordIds } from 'src/engine/permissions/private-record/utils/find-permissions-creator-admitted-record-ids.util';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import { findPermissionsShareAdmittedRecordIds } from 'src/engine/permissions/record-share/utils/find-permissions-share-admitted-record-ids.util';
import { findPermissionsRlsAdmittedRecordIds } from 'src/engine/permissions/rls/utils/find-permissions-rls-admitted-record-ids.util';
import { findPermissionsObjectAdmittedRecordIds } from 'src/engine/permissions/role/utils/find-permissions-object-admitted-record-ids.util';
import { type RowAccessPolicy } from 'src/engine/permissions/combine/types/row-access-policy.type';

export type RowAccessRecord = { id: string } & Record<string, unknown>;

export type RowAccessEvaluationContext = {
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  shouldIgnoreSoftDeleteDefaultFilter: boolean;
  fetchRecordShares: (args: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<RecordShareGrant[]>;
  findPrivateRecordStates: (args: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<Map<string, PrivateRecordState>>;
};

// Runs the same grant paths as buildPermissionsCondition, so queries and events agree
export const findPermissionsAdmittedRecordIds = async <
  TRecord extends RowAccessRecord,
>({
  policy,
  records,
  context,
}: {
  policy: RowAccessPolicy;
  records: TRecord[];
  context: RowAccessEvaluationContext;
}): Promise<Set<string>> => {
  switch (policy.kind) {
    case 'open':
      return new Set(records.map((record) => record.id));
    case 'denied':
      return new Set();
    case 'gated':
      break;
    default:
      return assertUnreachable(policy);
  }

  const { grants } = policy;
  const recordIds = records.map((record) => record.id);

  if (recordIds.length === 0) {
    return new Set();
  }

  const { rowLevelPermissionGrant, shareGrant, creatorGrant } = grants;
  const objectMetadataId = grants.flatObjectMetadata.id;
  const isLimitedToPublicRecords = grants.areRoleGrantsLimitedToPublicRecords;
  const isReadingPrivacy =
    (isLimitedToPublicRecords &&
      (grants.isObjectGranted || isDefined(rowLevelPermissionGrant))) ||
    (isDefined(shareGrant) && shareGrant.isLimitedToPrivateRecords) ||
    isDefined(creatorGrant);
  const privateRecordStates = isReadingPrivacy
    ? await context.findPrivateRecordStates({ objectMetadataId, recordIds })
    : new Map<string, PrivateRecordState>();
  const findRowLevelPermissionAdmittedRecordIds = ({
    isLimitedToPublicRecords,
  }: {
    isLimitedToPublicRecords: boolean;
  }) =>
    isDefined(rowLevelPermissionGrant)
      ? findPermissionsRlsAdmittedRecordIds({
          records,
          recordFilter: rowLevelPermissionGrant.recordFilter,
          flatObjectMetadata: grants.flatObjectMetadata,
          flatFieldMetadataMaps: context.flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter:
            context.shouldIgnoreSoftDeleteDefaultFilter,
          isLimitedToPublicRecords,
          privateRecordStates,
        })
      : [];

  const admittedRecordIds = new Set([
    ...(grants.isObjectGranted
      ? findPermissionsObjectAdmittedRecordIds({
          recordIds,
          isLimitedToPublicRecords,
          privateRecordStates,
        })
      : []),
    ...findRowLevelPermissionAdmittedRecordIds({ isLimitedToPublicRecords }),
  ]);

  const recordGrantCandidateIds = new Set(
    grants.areRecordGrantsHeldToRowLevelPermissions &&
      isDefined(rowLevelPermissionGrant)
      ? findRowLevelPermissionAdmittedRecordIds({
          isLimitedToPublicRecords: false,
        })
      : recordIds,
  );
  const remainingRecordIds = recordIds.filter(
    (recordId) =>
      !admittedRecordIds.has(recordId) && recordGrantCandidateIds.has(recordId),
  );

  if (remainingRecordIds.length === 0) {
    return admittedRecordIds;
  }

  const recordGrantAdmittedRecordIds = [
    ...(isDefined(shareGrant)
      ? findPermissionsShareAdmittedRecordIds({
          ...shareGrant,
          recordIds: remainingRecordIds,
          recordShares: await context.fetchRecordShares({
            objectMetadataId,
            recordIds: remainingRecordIds,
          }),
          privateRecordStates,
        })
      : []),
    ...(isDefined(creatorGrant)
      ? findPermissionsCreatorAdmittedRecordIds({
          recordIds: remainingRecordIds,
          workspaceMemberId: creatorGrant.workspaceMemberId,
          privateRecordStates,
        })
      : []),
  ];

  return new Set([...admittedRecordIds, ...recordGrantAdmittedRecordIds]);
};
