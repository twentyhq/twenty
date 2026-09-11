import { MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export type RecordShareGateKind = 'open' | 'deny' | 'private' | 'inherited';

export const resolveRecordShareGateKind = ({
  readability,
  isOwningApplication,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
}): RecordShareGateKind => {
  switch (readability) {
    case MetadataReadability.OPEN:
      return 'open';
    case MetadataReadability.SYSTEM:
      return 'deny';
    case MetadataReadability.APPLICATION:
      return isOwningApplication ? 'open' : 'deny';
    case MetadataReadability.PRIVATE:
      return isOwningApplication ? 'open' : 'private';
    case MetadataReadability.INHERITED:
      // The child holds no rows of its own: its parents decide, and only the
      // caller's metadata maps can resolve them
      return isOwningApplication ? 'open' : 'inherited';
    default:
      assertUnreachable(readability);
  }
};
