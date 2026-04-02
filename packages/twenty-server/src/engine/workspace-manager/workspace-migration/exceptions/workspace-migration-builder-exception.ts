import { type WorkspaceMigrationOrchestratorFailedResult } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export class WorkspaceMigrationBuilderException extends Error {
  constructor(
    public readonly failedWorkspaceMigrationBuildResult: WorkspaceMigrationOrchestratorFailedResult,
    message = 'Workspace migration builder failed',
  ) {
    super(message);
    for (const failures of Object.values(
      failedWorkspaceMigrationBuildResult.report,
    )) {
      for (const failure of failures) {
        failure.errors = failure.errors.map(
          (error) => JSON.stringify(error) as any,
        );
      }
    }
    this.name = 'WorkspaceMigrationBuilderException';
  }
}
