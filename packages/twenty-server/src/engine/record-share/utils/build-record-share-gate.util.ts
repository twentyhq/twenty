import { type MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { DENY_ALL_RECORD_SHARE_GATE } from 'src/engine/record-share/constants/deny-all-record-share-gate.constant';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';

// The share rows are only worth fetching for a PRIVATE object, so the caller
// hands over how to get them and the gate kind decides whether to ask
export const buildRecordShareGate = async ({
  readability,
  isOwningApplication,
  principalIds,
  fetchRecordShares,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
  principalIds: (string | null | undefined)[];
  fetchRecordShares: () => Promise<RecordShare[]>;
}): Promise<RecordShareGate | null> => {
  const gateKind = resolveRecordShareGateKind({
    readability,
    isOwningApplication,
  });

  switch (gateKind) {
    case 'open':
      return null;
    case 'deny':
      return DENY_ALL_RECORD_SHARE_GATE;
    case 'private':
      return {
        recordShares: await fetchRecordShares(),
        principalIds: [
          ...new Set(
            principalIds.filter(
              (principalId): principalId is string =>
                typeof principalId === 'string',
            ),
          ),
        ],
      };
    default:
      return assertUnreachable(gateKind);
  }
};
