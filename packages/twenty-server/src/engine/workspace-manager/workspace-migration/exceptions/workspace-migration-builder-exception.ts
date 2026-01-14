import { type WorkspaceMigrationOrchestratorFailedResult } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export class WorkspaceMigrationBuilderException extends Error {
  constructor(
    public readonly failedWorkspaceMigrationBuildResult: WorkspaceMigrationOrchestratorFailedResult,
    message = 'Workspace migration builder failed',
  ) {
    super(message);
    this.name = 'WorkspaceMigrationBuilderException';
  }
}
