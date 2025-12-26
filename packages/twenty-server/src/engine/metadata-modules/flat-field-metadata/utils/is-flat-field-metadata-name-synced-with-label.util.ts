import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isFlatFieldMetadataNameSyncedWithLabel = ({
  flatFieldMetadata,
  isSystemBuild,
}: {
  flatFieldMetadata: Pick<
    FlatFieldMetadata,
    'name' | 'isLabelSyncedWithName' | 'label'
  >;
  isSystemBuild: boolean;
}) => {
  const computedName = computeMetadataNameFromLabel({
    label: flatFieldMetadata.label,
    applyCustomSuffix: !isSystemBuild,
  });

  return flatFieldMetadata.name === computedName;
};
