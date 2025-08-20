import { type FailedWorkspaceMigrationBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';

export class WorkspaceMigrationBuilderExceptionV2 extends Error {
  public tmp: FailedWorkspaceMigrationBuildResult;
  constructor(
    public readonly failedWorkspaceMigrationBuildResult: FailedWorkspaceMigrationBuildResult,
    message = 'Workspace migration builder failed',
  ) {
    super(message);
    this.name = 'WorkspaceMigrationBuilderExceptionV2';
    this.tmp = failedWorkspaceMigrationBuildResult;
  }
}
