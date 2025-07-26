import { ConvertActionTypeToCamelCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/convert-action-type-to-camel-case.type';
import {
  WorkspaceMigrationActionTypeV2,
  WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

export type RunnerMethodForActionType<
  TAction extends WorkspaceMigrationActionTypeV2,
  TRunner extends 'metadata' | 'schema',
> = {
  [P in TAction as `run${Capitalize<ConvertActionTypeToCamelCase<P>>}${Capitalize<TRunner>}Migration`]: (
    arg: WorkspaceMigrationActionRunnerArgs<
      Extract<WorkspaceMigrationActionV2, { type: P }>
    >,
  ) => Promise<void>;
};
