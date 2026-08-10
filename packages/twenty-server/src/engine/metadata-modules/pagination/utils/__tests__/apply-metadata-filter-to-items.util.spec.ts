import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { applyMetadataFilterToItems } from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-items.util';

describe('applyMetadataFilterToItems', () => {
  it('applies nested filters to batched in-memory relations', () => {
    type TestFilter = {
      and?: TestFilter[];
      id?: { gt?: string; lt?: string };
      isActive?: { is?: boolean };
    };

    const items = [
      { id: 'a', isActive: true },
      { id: 'b', isActive: false },
      { id: 'c', isActive: true },
    ];

    expect(
      applyMetadataFilterToItems<(typeof items)[number], TestFilter>({
        items,
        filter: {
          and: [{ isActive: { is: true } }],
          id: { gt: 'a', lt: 'c' },
        },
        columnByFilterField: {
          id: { column: 'id', type: 'uuid' },
          isActive: { column: 'isActive', type: 'boolean' },
        },
      }),
    ).toEqual([]);
  });

  it('matches UUID filters regardless of operand casing', () => {
    type UuidFilter = {
      and?: UuidFilter[];
      or?: UuidFilter[];
      id?: { eq?: string; neq?: string; in?: string[]; notIn?: string[] };
    };

    const items = [{ id: '00000000-0000-4000-8000-00000000000a' }];
    const columnByFilterField = {
      id: { column: 'id', type: 'uuid' },
    } as const;
    const upperCasedId = items[0].id.toUpperCase();

    const matching = (filter: UuidFilter) =>
      applyMetadataFilterToItems<(typeof items)[number], UuidFilter>({
        items,
        filter,
        columnByFilterField,
      });

    expect(matching({ id: { eq: upperCasedId } })).toEqual(items);
    expect(matching({ id: { in: [upperCasedId] } })).toEqual(items);
    expect(matching({ id: { neq: upperCasedId } })).toEqual([]);
    expect(matching({ id: { notIn: [upperCasedId] } })).toEqual([]);
  });

  it('inverts aliased boolean columns', () => {
    type ReadOnlyFilter = {
      and?: ReadOnlyFilter[];
      or?: ReadOnlyFilter[];
      isUIReadOnly?: { is?: boolean };
    };

    const items = [{ id: 'a', isUIEditable: false }];

    expect(
      applyMetadataFilterToItems<(typeof items)[number], ReadOnlyFilter>({
        items,
        filter: { isUIReadOnly: { is: true } },
        columnByFilterField: {
          isUIReadOnly: {
            column: 'isUIEditable',
            type: 'boolean',
            invertBooleanValues: true,
          },
        },
      }),
    ).toEqual(items);
  });

  it('rejects unknown filter fields', () => {
    type UnknownFieldFilter = {
      and?: UnknownFieldFilter[];
      or?: UnknownFieldFilter[];
      unknownField?: { eq?: string };
    };

    expect(() =>
      applyMetadataFilterToItems<{ id: string }, UnknownFieldFilter>({
        items: [{ id: 'a' }],
        filter: { unknownField: { eq: 'a' } },
        columnByFilterField: {},
      }),
    ).toThrow(UserInputError);
  });
});
