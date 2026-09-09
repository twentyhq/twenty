import { isNonEmptyString } from '@sniptt/guards';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { isRecordSharedWithPrincipals } from 'src/engine/record-share/utils/is-record-shared-with-principals.util';
import { type RecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';

export type LinkedRecordShareGate = {
  gateKindByObjectMetadataId: Record<string, RecordShareGateKind>;
  recordSharesByObjectMetadataIdAndRecordId: Map<
    string,
    Map<string, RecordShare[]>
  >;
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
    case 'private': {
      const recordSharesByRecordId =
        linkedRecordShareGate.recordSharesByObjectMetadataIdAndRecordId.get(
          linkedObjectMetadataId,
        );

      return (
        isNonEmptyString(linkedRecordId) &&
        isDefined(recordSharesByRecordId) &&
        isRecordSharedWithPrincipals({
          recordShareGate: {
            recordSharesByRecordId,
            principalIds: linkedRecordShareGate.principalIds,
          },
          recordId: linkedRecordId,
          accessLevels,
        })
      );
    }
    default:
      assertUnreachable(gateKind);
  }
};
