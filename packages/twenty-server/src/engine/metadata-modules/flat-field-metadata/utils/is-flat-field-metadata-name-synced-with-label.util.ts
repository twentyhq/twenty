import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

export const isFlatFieldMetadataNameSyncedWithLabel = (
  flatFieldMetadata: Pick<
    FlatFieldMetadata,
    'name' | 'isLabelSyncedWithName' | 'label'
  >,
) => {
  const computedName = computeMetadataNameFromLabel(flatFieldMetadata.label);

  return flatFieldMetadata.name === computedName;
};
