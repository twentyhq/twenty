import { SyncGateService } from 'src/modules/executive-search/sync/services/sync-gate.service';

describe('SyncGateService', () => {
  let service: SyncGateService;

  beforeEach(() => {
    service = new SyncGateService();
  });

  it('should return true when both url and api key are set', () => {
    const result = service.isSyncEnabled(
      'https://directus.example.com',
      'sk-abc123',
    );

    expect(result).toBe(true);
  });

  it('should return false when directusUrl is undefined', () => {
    const result = service.isSyncEnabled(undefined, 'sk-abc123');

    expect(result).toBe(false);
  });

  it('should return false when directusApiKey is undefined', () => {
    const result = service.isSyncEnabled(
      'https://directus.example.com',
      undefined,
    );

    expect(result).toBe(false);
  });

  it('should return false when both are undefined', () => {
    const result = service.isSyncEnabled(undefined, undefined);

    expect(result).toBe(false);
  });

  it('should return false for empty string url', () => {
    const result = service.isSyncEnabled('', 'sk-abc123');

    expect(result).toBe(false);
  });

  it('should return false for empty string api key', () => {
    const result = service.isSyncEnabled('https://directus.example.com', '');

    expect(result).toBe(false);
  });

  it('should return false for whitespace-only url', () => {
    const result = service.isSyncEnabled('   ', 'sk-abc123');

    expect(result).toBe(false);
  });

  it('should return false for whitespace-only api key', () => {
    const result = service.isSyncEnabled('https://directus.example.com', '   ');

    expect(result).toBe(false);
  });
});
