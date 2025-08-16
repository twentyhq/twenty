import { type FailedMetadataValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-metadata-validate-and-build.type';
import { type SuccessfulMetadataValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/successful-metadata-validate-and-build.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type FailedAndSuccessfulMetadataValidateAndBuildRecord<
  T extends WorkspaceMigrationActionV2 = WorkspaceMigrationActionV2,
> = {
  failed: FailedMetadataValidateAndBuild[];
  successful: SuccessfulMetadataValidateAndBuild<T>[];
};
