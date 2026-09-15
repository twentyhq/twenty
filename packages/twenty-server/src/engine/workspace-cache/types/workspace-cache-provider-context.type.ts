import {
  type WorkspaceCacheRowsRequirement,
  type WorkspaceCacheRows,
} from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

export type WorkspaceCacheProviderContext<
  TRowsRequirement extends WorkspaceCacheRowsRequirement =
    WorkspaceCacheRowsRequirement,
> = {
  workspaceId: string;
  rows: WorkspaceCacheRows<TRowsRequirement>;
};
