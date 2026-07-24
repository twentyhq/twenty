import { type ObjectRecord } from 'twenty-shared/types';

import {
  baseRecord,
  matchRLSRowLevelPermissionPredicate,
  recordWithPhones,
} from 'src/engine/twenty-orm/utils/__tests__/is-record-matching-rls-row-level-permission-predicate.fixture';

describe('isRecordMatchingRLSRowLevelPermissionPredicate', () => {
  it('returns true for an empty filter on non-deleted record', () => {
    expect(matchRLSRowLevelPermissionPredicate({ filter: {} })).toBe(true);
  });

  it('returns false for deleted records without deletedAt filter', () => {
    expect(
      matchRLSRowLevelPermissionPredicate({
        record: { ...baseRecord, deletedAt: new Date().toISOString() },
        filter: {
          jobTitle: {
            eq: 'Engineer',
          },
        },
      }),
    ).toBe(false);
  });

  it('treats multiple filter keys as an implicit and', () => {
    expect(
      matchRLSRowLevelPermissionPredicate({
        filter: {
          jobTitle: {
            eq: 'Engineer',
          },
          name: {
            firstName: {
              eq: 'Jane',
            },
          },
        },
      }),
    ).toBe(true);
  });

  describe('when using "or" with an object', () => {
    const filter = {
      or: {
        jobTitle: {
          eq: 'Engineer',
        },
        name: {
          lastName: {
            eq: 'Doe',
          },
        },
      },
    };

    it('matches when all branches match', () => {
      expect(matchRLSRowLevelPermissionPredicate({ filter })).toBe(true);
    });

    it('does not match when one branch fails', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: {
            ...baseRecord,
            name: {
              ...baseRecord.name,
              lastName: 'Smith',
            },
          },
          filter,
        }),
      ).toBe(false);
    });
  });

  it('supports "not" filter negation', () => {
    expect(
      matchRLSRowLevelPermissionPredicate({
        filter: {
          not: {
            jobTitle: {
              eq: 'Engineer',
            },
          },
        },
      }),
    ).toBe(false);
  });

  it('matches composite address filters using at least one sub-field', () => {
    expect(
      matchRLSRowLevelPermissionPredicate({
        filter: {
          address: {
            addressStreet1: {
              eq: 'Main Street',
            },
            addressCity: {
              eq: 'London',
            },
          },
        },
      }),
    ).toBe(true);
  });

  it('supports relation join column filters', () => {
    expect(
      matchRLSRowLevelPermissionPredicate({
        filter: {
          companyId: {
            eq: 'company-1',
          },
        },
      }),
    ).toBe(true);
  });

  describe('when matching relation emptiness', () => {
    it('matches "is not empty" when the related record exists', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: {
            ...baseRecord,
            company: { id: 'company-1' },
          } as ObjectRecord,
          filter: { company: { is: 'NOT_NULL' } },
        }),
      ).toBe(true);
    });

    it('does not match "is not empty" when the related record is null', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: { ...baseRecord, company: null } as ObjectRecord,
          filter: { company: { is: 'NOT_NULL' } },
        }),
      ).toBe(false);
    });

    it('matches "is empty" when the related record is null', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: { ...baseRecord, company: null } as ObjectRecord,
          filter: { company: { is: 'NULL' } },
        }),
      ).toBe(true);
    });

    it('does not match "is empty" when the related record exists', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: {
            ...baseRecord,
            company: { id: 'company-1' },
          } as ObjectRecord,
          filter: { company: { is: 'NULL' } },
        }),
      ).toBe(false);
    });
  });

  describe('when handling malformed filters', () => {
    it('returns false for undefined leaf values', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            jobTitle: undefined,
          },
        }),
      ).toBe(false);
    });

    it('returns false for unknown fields', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            unknownField: {
              eq: 'value',
            },
          },
        }),
      ).toBe(false);
    });

    it('returns false for invalid "and" values', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            and: 'invalid',
          },
        }),
      ).toBe(false);
    });

    it('returns false for invalid "or" values', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            or: 123,
          },
        }),
      ).toBe(false);
    });

    it('returns false for undefined "not" values', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            not: undefined,
          },
        }),
      ).toBe(false);
    });

    it('denies access when "not" contains unknown fields', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            not: {
              unknownField: {
                eq: 'value',
              },
            },
          },
        }),
      ).toBe(false);
    });

    it('denies access when "or" contains null entries', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            or: [
              {
                jobTitle: {
                  eq: 'Engineer',
                },
              },
              null,
            ],
          },
        }),
      ).toBe(false);
    });

    it('denies access when "and" contains null entries', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            and: [null],
          },
        }),
      ).toBe(false);
    });

    it('denies access for malformed text leaf payloads', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            jobTitle: {
              bogus: true,
            },
          },
        }),
      ).toBe(false);
    });

    it('denies access for malformed composite leaf payloads', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            name: {
              bogus: true,
            },
          },
        }),
      ).toBe(false);
    });

    it('denies access when composite filters include unknown sub-fields', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          filter: {
            name: {
              firstName: {
                eq: 'Jane',
              },
              bogus: true,
            },
          },
        }),
      ).toBe(false);
    });
  });

  describe('when matching phones filters', () => {
    it('evaluates additional phone sub-fields', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: recordWithPhones,
          filter: {
            phones: {
              additionalPhones: {
                is: 'NULL',
              },
            },
          },
        }),
      ).toBe(false);
    });

    it('supports nested logical combinators on phone sub-fields', () => {
      expect(
        matchRLSRowLevelPermissionPredicate({
          record: recordWithPhones,
          filter: {
            not: {
              and: [
                {
                  or: [
                    {
                      phones: {
                        primaryPhoneNumber: { is: 'NULL' },
                      },
                    },
                    {
                      phones: {
                        primaryPhoneNumber: { ilike: '' },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      phones: {
                        additionalPhones: { is: 'NULL' },
                      },
                    },
                    {
                      phones: {
                        additionalPhones: { like: '[]' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        }),
      ).toBe(true);
    });
  });
});
