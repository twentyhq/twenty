import { BlocklistScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type BlocklistItem } from 'src/modules/blocklist/types/blocklist-item.type';
import { type BlocklistMutationContext } from 'src/modules/blocklist/types/blocklist-mutation-context.type';

export type BlocklistUniquenessGroup = {
  scope: BlocklistScope;
  workspaceMemberId: string;
  handles: string[];
  retainedHandles: string[];
};

export const groupBlocklistEntriesForUniqueness = ({
  entries,
  context,
}: {
  entries: {
    item: Partial<Pick<BlocklistItem, 'handle' | 'scope'>>;
    existingRecord: Pick<
      BlocklistWorkspaceEntity,
      'handle' | 'scope' | 'workspaceMemberId'
    > | null;
  }[];
  context: BlocklistMutationContext;
}): BlocklistUniquenessGroup[] => {
  const groups = new Map<string, BlocklistUniquenessGroup>();

  for (const { item, existingRecord } of entries) {
    if (!isDefined(item.handle)) {
      continue;
    }

    if (existingRecord?.handle === item.handle) {
      continue;
    }

    const scope =
      existingRecord?.scope ?? item.scope ?? BlocklistScope.WORKSPACE_MEMBER;
    const workspaceMemberId =
      existingRecord?.workspaceMemberId ?? context.workspaceMemberId;

    const groupKey = `${scope}:${workspaceMemberId}`;
    const group = groups.get(groupKey) ?? {
      scope,
      workspaceMemberId,
      handles: [],
      retainedHandles: [],
    };

    group.handles.push(item.handle);

    if (isDefined(existingRecord?.handle)) {
      group.retainedHandles.push(existingRecord.handle);
    }

    groups.set(groupKey, group);
  }

  return [...groups.values()];
};
