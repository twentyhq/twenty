import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

export const areFlatObjectMetadataNamesSyncedWithLabels = (
  flatObjectdMetadata: Pick<
    FlatObjectMetadata,
    'namePlural' | 'nameSingular' | 'labelPlural' | 'labelSingular'
  >,
) => {
  const [computedSingularName, computedPluralName] = [
    flatObjectdMetadata.labelSingular,
    flatObjectdMetadata.labelPlural,
  ].map(computeMetadataNameFromLabel);

  return (
    flatObjectdMetadata.nameSingular === computedSingularName &&
    flatObjectdMetadata.namePlural === computedPluralName
  );
};
