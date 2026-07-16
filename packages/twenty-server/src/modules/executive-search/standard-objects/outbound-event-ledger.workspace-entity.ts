import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { OutboundEventLedgerStatus } from 'src/modules/executive-search/standard-objects/enums/outbound-event-ledger-status.enum';
import { InboundEventLedgerSourceSystem as OutboundEventLedgerSourceSystem } from 'src/modules/executive-search/standard-objects/enums/inbound-event-ledger-source-system.enum';

export class OutboundEventLedgerWorkspaceEntity extends BaseWorkspaceEntity {
  eventId: string;
  eventType: string;
  eventVersion: number;
  sourceSystem: OutboundEventLedgerSourceSystem;
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
  status: OutboundEventLedgerStatus;
  statusMessage: string | null;
  deliveryAttempts: number;
  lastDeliveryAttemptAt: string | null;
  deliveredAt: string | null;
}
