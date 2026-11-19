import { getJobConfigsManifestErrors } from '@/application/utils/getJobConfigsManifestErrors';

const LIMITER = { max: 10, durationMs: 60_000 };

describe('getJobConfigsManifestErrors', () => {
  it('should accept logic functions referencing declared job configs', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [{ key: 'api', limiter: LIMITER }],
        logicFunctions: [
          { universalIdentifier: 'function-1', jobConfigKeys: ['api'] },
          { universalIdentifier: 'function-2' },
        ],
      }),
    ).toEqual([]);
  });

  it('should reject a key declared twice', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [
          { key: 'api', limiter: LIMITER },
          { key: 'api', limiter: LIMITER },
        ],
        logicFunctions: [],
      }),
    ).toEqual(['Job config key "api" is declared more than once']);
  });

  it('should reject a logic function referencing an unknown key', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [],
        logicFunctions: [
          { universalIdentifier: 'function-1', jobConfigKeys: ['api'] },
        ],
      }),
    ).toEqual([
      'Logic function function-1 references the unknown job config key "api"',
    ]);
  });

  it('should reject an invalid limiter', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [{ key: 'api', limiter: { max: 0, durationMs: -1 } }],
        logicFunctions: [],
      }),
    ).toEqual([
      'Job config "api" limiter max must be a positive integer',
      'Job config "api" limiter durationMs must be a positive number',
    ]);
  });
});
