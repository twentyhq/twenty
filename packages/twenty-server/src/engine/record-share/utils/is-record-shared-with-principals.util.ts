import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';

export const isRecordSharedWithPrincipals = ({
  recordShares,
  recordId,
  principalIds,
  accessLevels,
}: {
  recordShares: RecordShare[];
  recordId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): boolean =>
  recordShares.some(
    (recordShare) =>
      recordShare.recordId === recordId &&
      principalIds.includes(recordShare.principalId) &&
      accessLevels.includes(recordShare.accessLevel),
  );
