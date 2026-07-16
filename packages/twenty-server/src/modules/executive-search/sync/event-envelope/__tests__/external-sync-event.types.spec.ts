import { readFileSync } from 'fs';
import { join } from 'path';

import type { ExternalSyncEvent } from '../external-sync-event.types';
import {
  INBOUND_EVENT_TYPES,
  OUTBOUND_EVENT_TYPES,
  ALL_KNOWN_EVENT_TYPES,
} from '../external-sync-event.constants';

describe('ExternalSyncEvent types', () => {
  it('valid fixture satisfies ExternalSyncEvent shape', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.valid.json',
    );
    const raw = JSON.parse(
      readFileSync(fixturePath, 'utf-8'),
    ) as ExternalSyncEvent;

    expect(typeof raw.eventId).toBe('string');
    expect(raw.eventId).toBe('evt-001');
    expect(typeof raw.eventType).toBe('string');
    expect(raw.eventType).toBe('executive.updated');
    expect(typeof raw.eventVersion).toBe('number');
    expect(raw.eventVersion).toBe(1);
    expect(raw.sourceSystem).toBe('DIRECTUS');
    expect(typeof raw.sourceCollection).toBe('string');
    expect(raw.sourceCollection).toBe('executives');
    expect(typeof raw.sourceRecordId).toBe('string');
    expect(raw.sourceRecordId).toBe('dir-exec-42');
    expect(typeof raw.sourceUpdatedAt).toBe('string');
    expect(raw.sourceUpdatedAt).toBe('2026-07-15T16:00:00Z');
    expect(raw.sourceHash).toBe('abc123');
    expect(typeof raw.workspaceKey).toBe('string');
    expect(raw.workspaceKey).toBe('ws-exec-search');
    expect(typeof raw.correlationId).toBe('string');
    expect(raw.correlationId).toBe('corr-001');
    expect(raw.causationId).toBeNull();
    expect(typeof raw.idempotencyKey).toBe('string');
    expect(raw.idempotencyKey).toBe('idem-exec-42-v3');
    expect(typeof raw.occurredAt).toBe('string');
    expect(raw.occurredAt).toBe('2026-07-15T16:00:01Z');
    expect(raw.actor).not.toBeNull();
    expect(raw.actor?.type).toBe('CANDIDATE');
    expect(raw.actor?.id).toBe('dir-exec-42');
    expect(Array.isArray(raw.changedFields)).toBe(true);
    expect(raw.changedFields).toEqual(['current_title']);
    expect(raw.payload).toBeNull();
  });

  it('INBOUND_EVENT_TYPES has 18 items', () => {
    expect(INBOUND_EVENT_TYPES).toHaveLength(18);
  });

  it('OUTBOUND_EVENT_TYPES has 14 items', () => {
    expect(OUTBOUND_EVENT_TYPES).toHaveLength(14);
  });

  it('ALL_KNOWN_EVENT_TYPES has 32 items', () => {
    expect(ALL_KNOWN_EVENT_TYPES).toHaveLength(32);
  });

  it('ALL_KNOWN_EVENT_TYPES includes all inbound and outbound types', () => {
    for (const t of INBOUND_EVENT_TYPES) {
      expect(ALL_KNOWN_EVENT_TYPES).toContain(t);
    }
    for (const t of OUTBOUND_EVENT_TYPES) {
      expect(ALL_KNOWN_EVENT_TYPES).toContain(t);
    }
  });
});
