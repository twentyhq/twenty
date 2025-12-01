import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isFlatFieldMetadataNameSyncedWithLabel = (
  flatFieldMetadata: Pick<
    FlatFieldMetadata,
    'name' | 'isLabelSyncedWithName' | 'label'
  >,
) => {
  const computedName = computeMetadataNameFromLabel(flatFieldMetadata.label);

  return flatFieldMetadata.name === computedName;
};
