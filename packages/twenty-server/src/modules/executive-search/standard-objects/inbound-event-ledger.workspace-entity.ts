import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { InboundEventLedgerSourceSystem } from 'src/modules/executive-search/standard-objects/enums/inbound-event-ledger-source-system.enum';
import { InboundEventLedgerStatus } from 'src/modules/executive-search/standard-objects/enums/inbound-event-ledger-status.enum';

export class InboundEventLedgerWorkspaceEntity extends BaseWorkspaceEntity {
  eventId: string;
  eventType: string;
  eventVersion: number;
  sourceSystem: InboundEventLedgerSourceSystem;
  sourceCollection: string;
  sourceRecordId: string;
  sourceHash: string | null;
  sourceUpdatedAt: string | null;
  workspaceKey: string;
  correlationId: string;
  causationId: string | null;
  idempotencyKey: string;
  occurredAt: string;
  payload: Record<string, unknown> | null;
  status: InboundEventLedgerStatus;
  statusMessage: string | null;
  processingAttempts: number;
  lastAttemptAt: string | null;
  processedAt: string | null;
}
