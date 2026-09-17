import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

export type BlocklistItem = Omit<
  BlocklistWorkspaceEntity,
  'createdAt' | 'updatedAt' | 'workspaceMember'
> & {
  createdAt: string;
  updatedAt: string;
};
