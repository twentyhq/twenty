import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { getMetadataEmptyWorkspaceMigrationActionRecord } from 'src/engine/workspace-manager/workspace-migration-v2/utils/get-metadata-empty-workspace-migration-action-record.util';

export const createEmptyOrchestratorActionsReport =
  (): OrchestratorActionsReport =>
    (
      Object.keys(ALL_METADATA_NAME) as (keyof typeof ALL_METADATA_NAME)[]
    ).reduce(
      (orchestratorReport, metadataName) => ({
        ...orchestratorReport,
        [metadataName]:
          getMetadataEmptyWorkspaceMigrationActionRecord(metadataName),
      }),
      {} as OrchestratorActionsReport,
    );
