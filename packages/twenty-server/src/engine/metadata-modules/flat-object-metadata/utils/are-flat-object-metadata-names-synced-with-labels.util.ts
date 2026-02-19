import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';

import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const areFlatObjectMetadataNamesSyncedWithLabels = ({
  flatObjectdMetadata,
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationBuilderOptions;
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
      applyCustomSuffix: !isCallerTwentyStandardApp(buildOptions),
    }),
  );

  return (
    flatObjectdMetadata.nameSingular === computedSingularName &&
    flatObjectdMetadata.namePlural === computedPluralName
  );
};
