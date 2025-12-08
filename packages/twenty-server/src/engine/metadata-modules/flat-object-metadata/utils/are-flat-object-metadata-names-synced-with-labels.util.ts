import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const areFlatObjectMetadataNamesSyncedWithLabels = ({
  flatObjectdMetadata,
  isSystemBuild,
}: {
  isSystemBuild: boolean;
  flatObjectdMetadata: Pick<
    FlatObjectMetadata,
    'namePlural' | 'nameSingular' | 'labelPlural' | 'labelSingular'
  >;
}) => {
  const [computedSingularName, computedPluralName] = [
    flatObjectdMetadata.labelSingular,
    flatObjectdMetadata.labelPlural,
  ].map((label) =>
    computeMetadataNameFromLabel({
      label,
      applyCustomSuffix: !isSystemBuild,
    }),
  );

  return (
    flatObjectdMetadata.nameSingular === computedSingularName &&
    flatObjectdMetadata.namePlural === computedPluralName
  );
};
