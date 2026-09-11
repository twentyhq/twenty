import { type MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { DENY_ALL_RECORD_SHARE_GATE } from 'src/engine/record-share/constants/deny-all-record-share-gate.constant';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';

// The share rows are only worth fetching and indexing for a PRIVATE object, so
// the caller hands over how to get them and the gate kind decides whether to ask
export const buildRecordShareGate = async ({
  readability,
  isOwningApplication,
  principalIds,
  fetchRecordSharesByRecordId,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
  principalIds: (string | null | undefined)[];
  fetchRecordSharesByRecordId: () => Promise<Map<string, RecordShare[]>>;
}): Promise<RecordShareGate | null> => {
  const gateKind = resolveRecordShareGateKind({
    readability,
    isOwningApplication,
  });

  switch (gateKind) {
    case 'open':
      return null;
    // Inheritance is resolved separately against the parents, never from the
    // child's own rows
    case 'inherited':
      return null;
    case 'deny':
      return DENY_ALL_RECORD_SHARE_GATE;
    case 'private':
      return {
        recordSharesByRecordId: await fetchRecordSharesByRecordId(),
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
