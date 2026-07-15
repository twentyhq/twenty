import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class ExternalSyncDLQWorkspaceEntity extends BaseWorkspaceEntity {
  workspaceId: string;
  sourceType: string;
  sourceRecordId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  error: string;
  errorClass: string;
  failedAt: string;
  searchVector: string;
}
