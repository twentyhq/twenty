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
  it('should require every token to match a subfield for complex filter string', () => {
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
              { name: { firstName: { ilike: '%john%' } } },
              { name: { lastName: { ilike: '%john%' } } },
            ],
          },
          {
            or: [
              { name: { firstName: { ilike: '%doe%' } } },
              { name: { lastName: { ilike: '%doe%' } } },
            ],
          },
        ],
      },
    ]);
  });

  it('should be insensitive to token order', () => {
    expect(
      generateILikeFiltersForCompositeFields('doe john', 'name', [
        'firstName',
        'lastName',
      ]),
    ).toEqual([
      {
        and: [
          {
            or: [
              { name: { firstName: { ilike: '%doe%' } } },
              { name: { lastName: { ilike: '%doe%' } } },
            ],
          },
          {
            or: [
              { name: { firstName: { ilike: '%john%' } } },
              { name: { lastName: { ilike: '%john%' } } },
            ],
          },
        ],
      },
    ]);
  });

  it('should normalize surrounding and repeated whitespace', () => {
    expect(
      generateILikeFiltersForCompositeFields('  john   doe  ', 'name', [
        'firstName',
        'lastName',
      ]),
    ).toEqual(
      generateILikeFiltersForCompositeFields('john doe', 'name', [
        'firstName',
        'lastName',
      ]),
    );
  });

  it('should not tokenize a single token padded with whitespace', () => {
    expect(
      generateILikeFiltersForCompositeFields('  john  ', 'name', [
        'firstName',
        'lastName',
      ]),
    ).toEqual([
      { name: { firstName: { ilike: '%john%' } } },
      { name: { lastName: { ilike: '%john%' } } },
    ]);
  });

  it('should keep returning per-subfield emptiness checks when emptyCheck is set', () => {
    expect(
      generateILikeFiltersForCompositeFields(
        'john doe',
        'name',
        ['firstName'],
        true,
      ),
    ).toEqual([
      {
        or: [
          { name: { firstName: { is: 'NULL' } } },
          { name: { firstName: { ilike: '' } } },
        ],
      },
    ]);
  });
});
