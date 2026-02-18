import { isMetadataRecordMatchingFilter } from 'src/engine/workspace-event-emitter/utils/is-metadata-record-matching-filter.util';

const record = {
  id: '1',
  name: 'Test Object',
  label: 'testObject',
  isActive: true,
  count: 42,
};

describe('isMetadataRecordMatchingFilter', () => {
  describe('empty filters', () => {
    it('should match any record when filter is empty', () => {
      expect(isMetadataRecordMatchingFilter({ record, filter: {} })).toBe(true);
    });
  });

  describe('and filter', () => {
    it('should match when all sub-filters match', () => {
      const filter = {
        and: [{ name: { eq: 'Test Object' } }, { isActive: { eq: true } }],
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });

    it('should not match when any sub-filter fails', () => {
      const filter = {
        and: [{ name: { eq: 'Test Object' } }, { isActive: { eq: false } }],
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(false);
    });

    it('should match when and array is empty', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { and: [] },
        }),
      ).toBe(true);
    });

    it('should throw when and value is not an array', () => {
      expect(() =>
        isMetadataRecordMatchingFilter({
          record,
          filter: { and: 'invalid' } as any,
        }),
      ).toThrow('Unexpected value for "and" filter');
    });
  });

  describe('or filter', () => {
    it('should match when any sub-filter matches', () => {
      const filter = {
        or: [{ name: { eq: 'Wrong Name' } }, { name: { eq: 'Test Object' } }],
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });

    it('should not match when no sub-filter matches', () => {
      const filter = {
        or: [{ name: { eq: 'Wrong' } }, { name: { eq: 'Also Wrong' } }],
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(false);
    });

    it('should match when or array is empty', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { or: [] },
        }),
      ).toBe(true);
    });

    it('should treat or with an object as an and', () => {
      const filter = {
        or: { name: { eq: 'Test Object' } },
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });

    it('should throw when or value is neither array nor object', () => {
      expect(() =>
        isMetadataRecordMatchingFilter({
          record,
          filter: { or: 'invalid' } as any,
        }),
      ).toThrow('Unexpected value for "or" filter');
    });
  });

  describe('not filter', () => {
    it('should negate a matching filter', () => {
      const filter = { not: { name: { eq: 'Test Object' } } };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(false);
    });

    it('should negate a non-matching filter', () => {
      const filter = { not: { name: { eq: 'Wrong' } } };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });

    it('should match when not contains an empty object', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { not: {} },
        }),
      ).toBe(true);
    });
  });

  describe('implicit and (multi-key filter)', () => {
    it('should treat multiple keys as an implicit AND', () => {
      const filter = {
        name: { eq: 'Test Object' },
        isActive: { eq: true },
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });

    it('should fail if any key in implicit AND does not match', () => {
      const filter = {
        name: { eq: 'Test Object' },
        isActive: { eq: false },
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(false);
    });
  });

  describe('eq operator', () => {
    it('should match equal string values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { eq: 'Test Object' } },
        }),
      ).toBe(true);
    });

    it('should not match different string values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { eq: 'Other' } },
        }),
      ).toBe(false);
    });

    it('should match equal boolean values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { isActive: { eq: true } },
        }),
      ).toBe(true);
    });
  });

  describe('neq operator', () => {
    it('should match when values are different', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { neq: 'Other' } },
        }),
      ).toBe(true);
    });

    it('should not match when values are equal', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { neq: 'Test Object' } },
        }),
      ).toBe(false);
    });
  });

  describe('in operator', () => {
    it('should match when value is in the array', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { in: ['Test Object', 'Other'] } },
        }),
      ).toBe(true);
    });

    it('should not match when value is not in the array', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { in: ['A', 'B'] } },
        }),
      ).toBe(false);
    });

    it('should return false when in value is not an array', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { in: 'not-array' } } as any,
        }),
      ).toBe(false);
    });
  });

  describe('is operator', () => {
    it('should match NULL for undefined values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record: { ...record, optional: undefined },
          filter: { optional: { is: 'NULL' } },
        }),
      ).toBe(true);
    });

    it('should not match NULL for defined values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { is: 'NULL' } },
        }),
      ).toBe(false);
    });

    it('should match NOT_NULL for defined values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { is: 'NOT_NULL' } },
        }),
      ).toBe(true);
    });

    it('should not match NOT_NULL for undefined values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record: { ...record, optional: undefined },
          filter: { optional: { is: 'NOT_NULL' } },
        }),
      ).toBe(false);
    });
  });

  describe('like operator', () => {
    it('should match with wildcard prefix', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { like: '%Object' } },
        }),
      ).toBe(true);
    });

    it('should match with wildcard suffix', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { like: 'Test%' } },
        }),
      ).toBe(true);
    });

    it('should match with wildcards on both sides', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { like: '%est Obj%' } },
        }),
      ).toBe(true);
    });

    it('should not match when pattern does not match', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { like: 'wrong%' } },
        }),
      ).toBe(false);
    });

    it('should escape regex special characters in pattern', () => {
      const specialRecord = { ...record, name: 'foo.bar' };

      expect(
        isMetadataRecordMatchingFilter({
          record: specialRecord,
          filter: { name: { like: 'foo.bar' } },
        }),
      ).toBe(true);

      // A dot in the pattern should NOT match any character
      expect(
        isMetadataRecordMatchingFilter({
          record: { ...record, name: 'fooXbar' },
          filter: { name: { like: 'foo.bar' } },
        }),
      ).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { like: '42' } },
        }),
      ).toBe(false);
    });
  });

  describe('ilike operator', () => {
    it('should match case-insensitively', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { ilike: '%test object%' } },
        }),
      ).toBe(true);
    });

    it('should escape regex special characters', () => {
      const specialRecord = { ...record, name: 'foo(bar)' };

      expect(
        isMetadataRecordMatchingFilter({
          record: specialRecord,
          filter: { name: { ilike: 'FOO(BAR)' } },
        }),
      ).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { ilike: '42' } },
        }),
      ).toBe(false);
    });
  });

  describe('gt operator', () => {
    it('should match when value is greater', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { gt: 40 } },
        }),
      ).toBe(true);
    });

    it('should not match when value is equal', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { gt: 42 } },
        }),
      ).toBe(false);
    });

    it('should not match when value is less', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { gt: 50 } },
        }),
      ).toBe(false);
    });
  });

  describe('gte operator', () => {
    it('should match when value is greater or equal', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { gte: 42 } },
        }),
      ).toBe(true);
    });

    it('should not match when value is less', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { gte: 43 } },
        }),
      ).toBe(false);
    });
  });

  describe('lt operator', () => {
    it('should match when value is less', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { lt: 50 } },
        }),
      ).toBe(true);
    });

    it('should not match when value is equal', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { lt: 42 } },
        }),
      ).toBe(false);
    });
  });

  describe('lte operator', () => {
    it('should match when value is less or equal', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { lte: 42 } },
        }),
      ).toBe(true);
    });

    it('should not match when value is greater', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { count: { lte: 41 } },
        }),
      ).toBe(false);
    });
  });

  describe('unknown operator', () => {
    it('should throw for unsupported operators', () => {
      expect(() =>
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: { unknownOp: 'value' } } as any,
        }),
      ).toThrow('Unsupported filter operator');
    });
  });

  describe('nested logical operators', () => {
    it('should handle deeply nested and/or/not', () => {
      const filter = {
        and: [
          {
            or: [
              { name: { eq: 'Wrong' } },
              { not: { isActive: { eq: false } } },
            ],
          },
          { count: { gte: 40 } },
        ],
      };

      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });

    it('should handle not with nested and', () => {
      const filter = {
        not: {
          and: [{ name: { eq: 'Test Object' } }, { count: { gt: 100 } }],
        },
      };

      // name matches but count > 100 fails, so AND = false, NOT = true
      expect(isMetadataRecordMatchingFilter({ record, filter })).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should skip non-object field filters', () => {
      // When fieldFilter is a primitive, it is skipped (returns true)
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: 'Test Object' },
        }),
      ).toBe(true);
    });

    it('should skip undefined field filters', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record,
          filter: { name: undefined },
        }),
      ).toBe(true);
    });

    it('should handle records with missing fields', () => {
      expect(
        isMetadataRecordMatchingFilter({
          record: { id: '1' },
          filter: { name: { eq: 'Test' } },
        }),
      ).toBe(false);
    });
  });
});
