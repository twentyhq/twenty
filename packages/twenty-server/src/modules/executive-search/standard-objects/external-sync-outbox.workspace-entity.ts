import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ExternalSyncOutboxWorkspaceEntity extends BaseWorkspaceEntity {
  workspaceId: string;
  eventId: string;
  domainIdempotencyKey: string;
  eventType: string;
  entityName: string;
  entityId: string;
  payload: Record<string, unknown>;
  status: string;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  nextRetryAt: string | null;
  searchVector: string;
}
