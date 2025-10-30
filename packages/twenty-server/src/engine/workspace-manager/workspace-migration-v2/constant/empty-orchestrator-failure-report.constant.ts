import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';

export const EMPTY_ORCHESTRATOR_FAILURE_REPORT =
  (): OrchestratorFailureReport =>
    (
      Object.keys(ALL_METADATA_NAME) as (keyof typeof ALL_METADATA_NAME)[]
    ).reduce(
      (orchestratorReport, metadataName) => ({
        ...orchestratorReport,
        [metadataName]: [],
      }),
      {} as OrchestratorFailureReport,
    );
