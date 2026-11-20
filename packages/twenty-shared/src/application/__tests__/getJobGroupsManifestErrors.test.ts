import { getJobGroupsManifestErrors } from '@/application/utils/getJobGroupsManifestErrors';

const LIMITER = { max: 10, durationMs: 60_000 };
const API_JOB_GROUP_UNIVERSAL_IDENTIFIER =
  '8a6f6a4e-2c1b-4f4e-9b8e-5d6f2a1c3b40';
const API_JOB_GROUP = {
  universalIdentifier: API_JOB_GROUP_UNIVERSAL_IDENTIFIER,
  name: 'api',
  limiter: LIMITER,
};

describe('getJobGroupsManifestErrors', () => {
  it('should accept logic functions referencing declared job groups', () => {
    expect(
      getJobGroupsManifestErrors({
        jobGroups: [API_JOB_GROUP],
        logicFunctions: [
          {
            universalIdentifier: 'function-1',
            jobGroupUniversalIdentifiers: [API_JOB_GROUP_UNIVERSAL_IDENTIFIER],
          },
          { universalIdentifier: 'function-2' },
        ],
      }),
    ).toEqual([]);
  });

  it('should reject a job group declared twice', () => {
    expect(
      getJobGroupsManifestErrors({
        jobGroups: [API_JOB_GROUP, { ...API_JOB_GROUP, name: 'other' }],
        logicFunctions: [],
      }),
    ).toEqual([
      `Job group ${API_JOB_GROUP_UNIVERSAL_IDENTIFIER} is declared more than once`,
    ]);
  });

  it('should reject a logic function referencing an unknown job group', () => {
    expect(
      getJobGroupsManifestErrors({
        jobGroups: [],
        logicFunctions: [
          {
            universalIdentifier: 'function-1',
            jobGroupUniversalIdentifiers: [API_JOB_GROUP_UNIVERSAL_IDENTIFIER],
          },
        ],
      }),
    ).toEqual([
      `Logic function function-1 references the unknown job group ${API_JOB_GROUP_UNIVERSAL_IDENTIFIER}`,
    ]);
  });

  it('should reject an invalid universalIdentifier and a blank name', () => {
    expect(
      getJobGroupsManifestErrors({
        jobGroups: [{ universalIdentifier: '', name: ' ', limiter: LIMITER }],
        logicFunctions: [],
      }),
    ).toEqual([
      'Job group " " must have a valid universalIdentifier',
      'Job group  must have a non-empty name',
    ]);
  });

  it('should reject an invalid limiter', () => {
    expect(
      getJobGroupsManifestErrors({
        jobGroups: [{ ...API_JOB_GROUP, limiter: { max: 0, durationMs: -1 } }],
        logicFunctions: [],
      }),
    ).toEqual([
      'Job group "api" limiter max must be a positive integer',
      'Job group "api" limiter durationMs must be a positive number',
    ]);
  });
});
