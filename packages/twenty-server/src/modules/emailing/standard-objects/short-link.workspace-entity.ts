import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ShortLinkWorkspaceEntity extends BaseWorkspaceEntity {
  templateUrl: string;
  resolvedUrl: string;
  identityHash: string;
}
