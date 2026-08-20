import { generateILikeFiltersForCompositeFields } from '@/utils/filter/utils/generateILikeFiltersForCompositeFields';

describe('generateILikeFiltersForCompositeFields', () => {
  it('should format composite filters for simple filter string', () => {
    expect(
      generateILikeFiltersForCompositeFields('john', 'baseField', [
        'subField1',
        'subField2',
      ]),
    ).toEqual([
      {
        baseField: {
          subField1: {
            ilike: '%john%',
          },
        },
      },
      {
        baseField: {
          subField2: {
            ilike: '%john%',
          },
        },
      },
    ]);
  });

  it('should trim padded single token filter string', () => {
    expect(
      generateILikeFiltersForCompositeFields('  john  ', 'baseField', [
        'subField1',
        'subField2',
      ]),
    ).toEqual([
      {
        baseField: {
          subField1: {
            ilike: '%john%',
          },
        },
      },
      {
        baseField: {
          subField2: {
            ilike: '%john%',
          },
        },
      },
    ]);
  });

  it('should return empty array for empty or whitespace-only filter string', () => {
    expect(
      generateILikeFiltersForCompositeFields('   ', 'baseField', [
        'subField1',
        'subField2',
      ]),
    ).toEqual([]);
  });

  it('should format composite filters for complex multi-token filter string with AND/OR conjunction', () => {
    expect(
      generateILikeFiltersForCompositeFields('john doe', 'name', [
        'firstName',
        'lastName',
      ]),
    ).toEqual([
      {
        and: [
          {
            or: [
              {
                name: {
                  firstName: {
                    ilike: '%john%',
                  },
                },
              },
              {
                name: {
                  lastName: {
                    ilike: '%john%',
                  },
                },
              },
            ],
          },
          {
            or: [
              {
                name: {
                  firstName: {
                    ilike: '%doe%',
                  },
                },
              },
              {
                name: {
                  lastName: {
                    ilike: '%doe%',
                  },
                },
              },
            ],
          },
        ],
      },
    ]);
  });
});
