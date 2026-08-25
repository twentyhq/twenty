import { BlocklistScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

type BlocklistHandlesByOwner = {
  workspaceScopedHandles: string[];
  handlesByWorkspaceMemberId: Map<string, string[]>;
};

export const groupBlocklistHandlesByOwner = (
  blocklist: Pick<
    BlocklistWorkspaceEntity,
    'handle' | 'scope' | 'workspaceMemberId'
  >[],
): BlocklistHandlesByOwner => {
  const workspaceScopedHandles: string[] = [];
  const handlesByWorkspaceMemberId = new Map<string, string[]>();

  for (const { handle, scope, workspaceMemberId } of blocklist) {
    if (!isDefined(handle)) {
      continue;
    }

    if (scope === BlocklistScope.WORKSPACE) {
      workspaceScopedHandles.push(handle);
      continue;
    }

    if (!isDefined(workspaceMemberId)) {
      continue;
    }

    const handles = handlesByWorkspaceMemberId.get(workspaceMemberId) ?? [];

    handles.push(handle);
    handlesByWorkspaceMemberId.set(workspaceMemberId, handles);
  }

  return { workspaceScopedHandles, handlesByWorkspaceMemberId };
};
