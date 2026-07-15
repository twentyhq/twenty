import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ExternalEntityLinkWorkspaceEntity extends BaseWorkspaceEntity {
  workspaceId: string;
  twentyEntityName: string;
  twentyRecordId: string;
  externalSystemName: string;
  externalEntityName: string;
  externalRecordId: string;
  authority: string;
  lastSyncedAt: string | null;
  searchVector: string;
}
