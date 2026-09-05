import { isNonEmptyString } from '@sniptt/guards';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { type RecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';

export type LinkedRecordShareGate = {
  gateKindByObjectMetadataId: Record<string, RecordShareGateKind>;
  recordShares: RecordShare[];
  principalIds: string[];
};

export const isLinkedRecordSharedWithPrincipals = ({
  record,
  linkedRecordShareGate,
  accessLevels,
}: {
  record: Record<string, unknown>;
  linkedRecordShareGate: LinkedRecordShareGate;
  accessLevels: RecordShareAccessLevel[];
}): boolean => {
  const { linkedObjectMetadataId, linkedRecordId } = record;

  if (!isNonEmptyString(linkedObjectMetadataId)) {
    return true;
  }

  const gateKind =
    linkedRecordShareGate.gateKindByObjectMetadataId[linkedObjectMetadataId] ??
    'open';

  switch (gateKind) {
    case 'open':
      return true;
    case 'deny':
      return false;
    case 'private':
      return (
        isNonEmptyString(linkedRecordId) &&
        isRecordSharedWithPrincipals({
          recordShares: linkedRecordShareGate.recordShares.filter(
            (recordShare) =>
              recordShare.objectMetadataId === linkedObjectMetadataId,
          ),
          recordId: linkedRecordId,
          principalIds: linkedRecordShareGate.principalIds,
          accessLevels,
        })
      );
    default:
      assertUnreachable(gateKind);
  }
};
