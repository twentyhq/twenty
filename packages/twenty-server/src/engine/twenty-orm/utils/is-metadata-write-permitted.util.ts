import { MetadataWritability } from 'twenty-shared/types';

export const isMetadataWritePermitted = ({
  writability,
  isSystemContext,
}: {
  writability: MetadataWritability | undefined;
  isSystemContext: boolean;
}): boolean => writability !== MetadataWritability.SYSTEM || isSystemContext;
