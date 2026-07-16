import { readFileSync } from 'fs';
import { join } from 'path';

import { SyncEventValidationService } from '../sync-event-validation.service';

describe('SyncEventValidationService', () => {
  let service: SyncEventValidationService;

  beforeEach(() => {
    service = new SyncEventValidationService();
  });

  it('(a) valid fixture passes validation', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.valid.json',
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    const result = service.validate(raw);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.event.eventId).toBe('evt-001');
      expect(result.event.eventType).toBe('executive.updated');
    }
  });

  it('(b) invalid fixture (missing required fields) fails with structured errors', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.invalid.json',
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    const result = service.validate(raw);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('(c) eventVersion: 2 fails on version', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.valid.json',
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    raw.eventVersion = 2;
    const result = service.validate(raw);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('Unsupported event version');
    }
  });

  it('(d) unknown eventType fails on type', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.valid.json',
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    raw.eventType = 'unknown.event.type';
    const result = service.validate(raw);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('Unknown event type');
    }
  });

  it('(e) extra property fails on additionalProperties', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.valid.json',
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    raw.extraField = 'should not be allowed';
    const result = service.validate(raw);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      const hasAdditionalPropsError = result.errors.some(
        (e) =>
          e.includes('additionalProperty') ||
          e.includes('additional properties') ||
          e.includes('extraField'),
      );
      expect(hasAdditionalPropsError).toBe(true);
    }
  });

  it('(f) invalid sourceSystem fails on enum', () => {
    const fixturePath = join(
      __dirname,
      '../../../../../../../../docs/executive-search/fixtures/external-sync-event.valid.json',
    );
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    raw.sourceSystem = 'INVALID_SYSTEM';
    const result = service.validate(raw);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});
