import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForDeferredWorkspaceMigrationActions } from 'test/integration/utils/wait-for-deferred-workspace-migration-actions.util';

import { type InProcessWorkspaceMigrationActionsService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/in-process-workspace-migration-actions.service';

// Mirrors WorkspaceCommandRunnerService for specs that call a workspace command directly.
export const runWithWorkspaceMigrationActionsInProcess = async <TResult>({
  workspaceId,
  callback,
}: {
  workspaceId: string;
  callback: () => Promise<TResult>;
}): Promise<TResult> => {
  await waitForDeferredWorkspaceMigrationActions();

  return getAppProviderByClassName<InProcessWorkspaceMigrationActionsService>(
    'InProcessWorkspaceMigrationActionsService',
  ).runWithActionsInProcess({ workspaceId, callback });
};
