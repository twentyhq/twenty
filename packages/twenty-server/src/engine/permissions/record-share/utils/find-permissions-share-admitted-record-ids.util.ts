/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { resolvePrivateRecordState } from 'src/engine/permissions/private-record/utils/resolve-private-record-state.util';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/permissions/record-share/utils/resolve-record-ids-shared-with-principals.util';

export const findPermissionsShareAdmittedRecordIds = ({
  recordIds,
  recordShares,
  principalIds,
  accessLevels,
  isLimitedToPrivateRecords,
  privateRecordStates,
}: {
  recordIds: string[];
  recordShares: RecordShareGrant[];
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  isLimitedToPrivateRecords: boolean;
  privateRecordStates: Map<string, PrivateRecordState>;
}): string[] => {
  const sharedRecordIds = resolveRecordIdsSharedWithPrincipals({
    recordShares,
    principalIds,
    accessLevels,
  });

  return recordIds.filter(
    (recordId) =>
      sharedRecordIds.has(recordId) &&
      (!isLimitedToPrivateRecords ||
        resolvePrivateRecordState({ recordId, privateRecordStates }).isPrivate),
  );
};
