import { FailedMetadataBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-metadata-build.type';
import { SuccessfulMetadataBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/successful-metadata-build.type';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type MetadataBuildResult<
  T extends WorkspaceMigrationActionV2 = WorkspaceMigrationActionV2,
> = FailedMetadataBuild | SuccessfulMetadataBuild<T>;
