import { type WorkspaceMigrationOrchestratorFailedResult } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';

export class WorkspaceMigrationBuilderExceptionV2 extends Error {
  constructor(
    public readonly failedWorkspaceMigrationBuildResult: WorkspaceMigrationOrchestratorFailedResult,
    message = 'Workspace migration builder failed',
  ) {
    super(message);
    this.name = 'WorkspaceMigrationBuilderExceptionV2';
  }
}
