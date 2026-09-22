import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ShortLinkWorkspaceEntity extends BaseWorkspaceEntity {
  destinationUrl: string;
}
