import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const areFlatObjectMetadataNamesSyncedWithLabels = ({
  flatObjectdMetadata,
  isSystemBuild,
}: {
  isSystemBuild: boolean;
  flatObjectdMetadata: Pick<
    UniversalFlatObjectMetadata,
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
