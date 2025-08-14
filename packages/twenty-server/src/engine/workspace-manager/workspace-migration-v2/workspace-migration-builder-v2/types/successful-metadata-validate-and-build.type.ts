import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type SuccessfulMetadataValidateAndBuild<
  T extends WorkspaceMigrationActionV2 = WorkspaceMigrationActionV2,
> = {
  status: 'success';
  result: T;
};
