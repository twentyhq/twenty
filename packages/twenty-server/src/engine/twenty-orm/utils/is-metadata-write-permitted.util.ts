import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isMetadataWritePermitted = ({
  writability,
  isSystemContext,
  isOwningApplication,
}: {
  writability: MetadataWritability | undefined;
  isSystemContext: boolean;
  isOwningApplication: boolean;
}): boolean =>
  !isDefined(writability) ||
  writability === MetadataWritability.OPEN ||
  isSystemContext ||
  (writability === MetadataWritability.APPLICATION && isOwningApplication);
