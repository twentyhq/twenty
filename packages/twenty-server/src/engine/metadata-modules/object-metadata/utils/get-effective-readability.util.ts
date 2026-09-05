import { type MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';

export type ReadabilityResolvableObjectMetadata = {
  overrides?: ObjectMetadataOverrides | null;
  readability: MetadataReadability;
};

export const getEffectiveReadability = (
  objectMetadata: ReadabilityResolvableObjectMetadata,
): MetadataReadability => {
  const { overrides } = objectMetadata;

  if (isDefined(overrides) && isDefined(overrides.readability)) {
    return overrides.readability;
  }

  return objectMetadata.readability;
};
