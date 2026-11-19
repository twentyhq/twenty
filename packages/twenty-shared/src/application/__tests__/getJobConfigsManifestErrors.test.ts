import { getJobConfigsManifestErrors } from '@/application/utils/getJobConfigsManifestErrors';

const LIMITER = { max: 10, durationMs: 60_000 };
const API_UNIVERSAL_IDENTIFIER = '8a6f6a4e-2c1b-4f4e-9b8e-5d6f2a1c3b40';
const OTHER_UNIVERSAL_IDENTIFIER = '3c2b1a0f-9e8d-4c7b-a6f5-4e3d2c1b0a99';

describe('getJobConfigsManifestErrors', () => {
  it('should accept logic functions referencing declared job configs', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [
          {
            universalIdentifier: API_UNIVERSAL_IDENTIFIER,
            key: 'api',
            limiter: LIMITER,
          },
        ],
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
          {
            universalIdentifier: API_UNIVERSAL_IDENTIFIER,
            key: 'api',
            limiter: LIMITER,
          },
          {
            universalIdentifier: OTHER_UNIVERSAL_IDENTIFIER,
            key: 'api',
            limiter: LIMITER,
          },
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

  it('should reject a missing universalIdentifier', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [{ universalIdentifier: '', key: 'api', limiter: LIMITER }],
        logicFunctions: [],
      }),
    ).toEqual(['Job config "api" must have a valid universalIdentifier']);
  });

  it('should reject an invalid limiter', () => {
    expect(
      getJobConfigsManifestErrors({
        jobConfigs: [
          {
            universalIdentifier: API_UNIVERSAL_IDENTIFIER,
            key: 'api',
            limiter: { max: 0, durationMs: -1 },
          },
        ],
        logicFunctions: [],
      }),
    ).toEqual([
      'Job config "api" limiter max must be a positive integer',
      'Job config "api" limiter durationMs must be a positive number',
    ]);
  });
});
