import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export const shouldInferDeletionFromMissingEntities = ({
  buildOptions,
  metadataName,
}: {
  buildOptions: WorkspaceMigrationBuilderOptions;
  metadataName: AllMetadataName;
}): boolean => {
  return (
    buildOptions.inferDeletionFromMissingEntities === true ||
    buildOptions.inferDeletionFromMissingEntities?.[metadataName] === true
  );
};
