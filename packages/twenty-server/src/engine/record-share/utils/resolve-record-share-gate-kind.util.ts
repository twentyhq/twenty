import { MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export type RecordShareGateKind = 'open' | 'deny' | 'private';

export const resolveRecordShareGateKind = ({
  readability,
  isOwningApplication,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
}): RecordShareGateKind => {
  switch (readability) {
    case MetadataReadability.OPEN:
    case MetadataReadability.INHERITED:
      return 'open';
    case MetadataReadability.SYSTEM:
      return 'deny';
    case MetadataReadability.APPLICATION:
      return isOwningApplication ? 'open' : 'deny';
    case MetadataReadability.PRIVATE:
      return isOwningApplication ? 'open' : 'private';
    default:
      assertUnreachable(readability);
  }
};
