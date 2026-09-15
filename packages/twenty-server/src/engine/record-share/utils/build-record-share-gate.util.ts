import { type MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { DENY_ALL_RECORD_SHARE_GATE } from 'src/engine/record-share/constants/deny-all-record-share-gate.constant';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';
import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';

export const buildRecordShareGate = async ({
  readability,
  isOwningApplication,
  principalIds,
  fetchRecordSharesByRecordId,
  resolveRecordIdsReadableThroughParents,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
  principalIds: (string | null | undefined)[];
  fetchRecordSharesByRecordId: () => Promise<Map<string, RecordShare[]>>;
  resolveRecordIdsReadableThroughParents: () => Promise<Set<string>>;
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
    case 'inherited':
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
        recordIdsReadableThroughParents:
          gateKind === 'inherited'
            ? await resolveRecordIdsReadableThroughParents()
            : new Set(),
      };
    default:
      return assertUnreachable(gateKind);
  }
};
