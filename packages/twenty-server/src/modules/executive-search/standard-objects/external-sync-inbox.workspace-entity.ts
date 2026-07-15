import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ExternalSyncInboxWorkspaceEntity extends BaseWorkspaceEntity {
  workspaceId: string;
  externalEventId: string;
  externalSystemName: string;
  eventType: string;
  entityName: string;
  entityId: string;
  payload: Record<string, unknown>;
  status: string;
  processedAt: string | null;
  error: string | null;
  searchVector: string;
}
