import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ExternalSyncCheckpointWorkspaceEntity extends BaseWorkspaceEntity {
  workspaceId: string;
  externalSystemName: string;
  entityName: string;
  lastExternalEventId: string | null;
  lastExternalEventTimestamp: string | null;
  lastSyncStartedAt: string | null;
  lastSyncCompletedAt: string | null;
  status: string;
  searchVector: string;
}
