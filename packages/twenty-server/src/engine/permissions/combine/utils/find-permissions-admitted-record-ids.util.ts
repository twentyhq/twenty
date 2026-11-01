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

// The in-memory counterpart of buildPermissionsCondition: both run the same
// grant paths, so a record admitted by a query is admitted here and vice versa
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

  const objectMetadataId = grants.flatObjectMetadata.id;
  const isLimitedToPublicRecords = grants.areRoleGrantsLimitedToPublicRecords;
  const isReadingPrivacy =
    isLimitedToPublicRecords ||
    grants.shareGrant?.isLimitedToPrivateRecords === true ||
    isDefined(grants.creatorGrant);
  const privateRecordStates = isReadingPrivacy
    ? await context.findPrivateRecordStates({ objectMetadataId, recordIds })
    : new Map<string, PrivateRecordState>();

  const admittedRecordIds = [
    ...(grants.objectGrant
      ? findPermissionsObjectAdmittedRecordIds({
          recordIds,
          isLimitedToPublicRecords,
          privateRecordStates,
        })
      : []),
    ...(isDefined(grants.rlsGrant)
      ? findPermissionsRlsAdmittedRecordIds({
          records,
          recordFilter: grants.rlsGrant.recordFilter,
          flatObjectMetadata: grants.flatObjectMetadata,
          flatFieldMetadataMaps: context.flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter:
            context.shouldIgnoreSoftDeleteDefaultFilter,
          isLimitedToPublicRecords,
          privateRecordStates,
        })
      : []),
    ...(isDefined(grants.shareGrant)
      ? findPermissionsShareAdmittedRecordIds({
          ...grants.shareGrant,
          recordIds,
          recordShares: await context.fetchRecordShares({
            objectMetadataId,
            recordIds,
          }),
          privateRecordStates,
        })
      : []),
    ...(isDefined(grants.creatorGrant)
      ? findPermissionsCreatorAdmittedRecordIds({
          recordIds,
          workspaceMemberId: grants.creatorGrant.workspaceMemberId,
          privateRecordStates,
        })
      : []),
  ];

  return new Set(admittedRecordIds);
};
