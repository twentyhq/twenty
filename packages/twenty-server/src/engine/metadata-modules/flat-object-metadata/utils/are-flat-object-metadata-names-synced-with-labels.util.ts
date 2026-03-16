import { computeMetadataNamesFromLabelsOrThrow } from 'twenty-shared/metadata';

import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const areFlatObjectMetadataNamesSyncedWithLabels = ({
  flatObjectMetadata,
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationBuilderOptions;
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'namePlural' | 'nameSingular' | 'labelPlural' | 'labelSingular'
  >;
}) => {
  const { nameSingular: computedSingularName, namePlural: computedPluralName } =
    computeMetadataNamesFromLabelsOrThrow({
      labelSingular: flatObjectMetadata.labelSingular,
      labelPlural: flatObjectMetadata.labelPlural,
      applyCustomSuffix: !isCallerTwentyStandardApp(buildOptions),
    });

  return (
    flatObjectMetadata.nameSingular === computedSingularName &&
    flatObjectMetadata.namePlural === computedPluralName
  );
};
