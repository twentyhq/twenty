import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isMetadataWritePermitted = ({
  writability,
  isSystemContext,
}: {
  writability: MetadataWritability | undefined;
  isSystemContext: boolean;
}): boolean =>
  !isDefined(writability) ||
  writability === MetadataWritability.OPEN ||
  isSystemContext;
