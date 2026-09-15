import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';

export const isRecordSharedWithPrincipals = ({
  recordShareGate,
  recordId,
  accessLevels,
}: {
  recordShareGate: RecordShareGate;
  recordId: string;
  accessLevels: RecordShareAccessLevel[];
}): boolean =>
  (recordShareGate.recordSharesByRecordId.get(recordId) ?? []).some(
    (recordShare) =>
      recordShareGate.principalIds.includes(recordShare.principalId) &&
      accessLevels.includes(recordShare.accessLevel),
  );
