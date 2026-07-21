import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';

type ImageIdentifierResolvableObjectMetadata = {
  overrides?: ObjectMetadataOverrides | null;
  imageIdentifierFieldMetadataId?: string | null;
};

export const getEffectiveImageIdentifierFieldMetadataId = (
  objectMetadata: ImageIdentifierResolvableObjectMetadata,
): string | null => {
  const { overrides } = objectMetadata;

  if (isDefined(overrides) && 'imageIdentifierFieldMetadataId' in overrides) {
    return overrides.imageIdentifierFieldMetadataId ?? null;
  }

  return objectMetadata.imageIdentifierFieldMetadataId ?? null;
};
