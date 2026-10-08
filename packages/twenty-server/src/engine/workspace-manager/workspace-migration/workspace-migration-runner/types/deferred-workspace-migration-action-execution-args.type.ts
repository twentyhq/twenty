import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

export type DeferredWorkspaceMigrationActionExecutionArgs<TPayload> = Pick<
  WorkspaceMigrationActionRunnerArgs<AllUniversalWorkspaceMigrationAction>,
  'queryRunner' | 'allFlatEntityMaps' | 'workspaceId'
> & {
  applicationUniversalIdentifier: string;
  payload: TPayload;
  attempt: number;
};
