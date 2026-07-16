export type ExternalSyncEventSourceSystem = 'DIRECTUS' | 'TWENTY';
export type ExternalSyncEventActorType =
  | 'USER'
  | 'APPLICATION'
  | 'SYSTEM'
  | 'CANDIDATE'
  | 'CLIENT';

export interface ExternalSyncEventActor {
  type?: ExternalSyncEventActorType;
  id?: string | null;
}

export interface ExternalSyncEvent {
  eventId: string;
  eventType: string;
  eventVersion: number;
  sourceSystem: ExternalSyncEventSourceSystem;
  sourceCollection: string;
  sourceRecordId: string;
  sourceUpdatedAt: string;
  sourceHash: string | null;
  workspaceKey: string;
  correlationId: string;
  causationId: string | null;
  idempotencyKey: string;
  occurredAt: string;
  actor?: ExternalSyncEventActor | null;
  changedFields?: string[] | null;
  payload?: Record<string, unknown> | null;
}

export type ExternalSyncEventValidationResult =
  | { success: true; event: ExternalSyncEvent }
  | { success: false; errors: string[] };
