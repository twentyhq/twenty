import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type SchemaActionContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/types/schema-action-context.type';

export interface WorkspaceMigrationActionService<
  TAction = WorkspaceMigrationActionV2,
> {
  execute(context: SchemaActionContext<TAction>): Promise<void>;
}
