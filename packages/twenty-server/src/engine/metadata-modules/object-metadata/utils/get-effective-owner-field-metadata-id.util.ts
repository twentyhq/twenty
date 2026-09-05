import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataOverrides } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-overrides.type';

export type OwnerFieldResolvableObjectMetadata = {
  overrides?: ObjectMetadataOverrides | null;
  ownerFieldMetadataId?: string | null;
};

export const getEffectiveOwnerFieldMetadataId = (
  objectMetadata: OwnerFieldResolvableObjectMetadata,
): string | null => {
  const { overrides } = objectMetadata;

  if (isDefined(overrides) && 'ownerFieldMetadataId' in overrides) {
    return overrides.ownerFieldMetadataId ?? null;
  }

  return objectMetadata.ownerFieldMetadataId ?? null;
};
