import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

export interface WorkspaceMigrationActionService {
  execute(
    context: WorkspaceMigrationActionRunnerArgs<WorkspaceMigrationActionV2>,
  ): Promise<void>;
}
