import { paginateMetadataItemsByKeyset } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-items-by-keyset.util';

const items = [
  { id: 'c', name: 'Beta' },
  { id: 'a', name: null },
  { id: 'b', name: 'Alpha' },
  { id: 'd', name: 'Beta' },
];

const paginateByName = ({
  direction,
  limit = items.length,
  after,
}: {
  direction: 'ASC' | 'DESC';
  limit?: number;
  after?: string;
}) =>
  paginateMetadataItemsByKeyset({
    items,
    limit,
    after,
    direction,
    getSortValue: ({ name }) => name,
    compareSortValues: (firstSortValue, secondSortValue) =>
      firstSortValue.localeCompare(secondSortValue),
  });

const getIds = (page: ReturnType<typeof paginateByName>) =>
  page.entries.map(({ item }) => item.id);

describe('paginateMetadataItemsByKeyset', () => {
  it('should sort ascending with null sort values last and ids breaking ties', () => {
    expect(getIds(paginateByName({ direction: 'ASC' }))).toEqual([
      'b',
      'c',
      'd',
      'a',
    ]);
  });

  it('should keep null sort values last when sorting descending', () => {
    expect(getIds(paginateByName({ direction: 'DESC' }))).toEqual([
      'd',
      'c',
      'b',
      'a',
    ]);
  });

  it('should continue strictly after the cursor of the previous page', () => {
    const firstPage = paginateByName({ direction: 'ASC', limit: 2 });

    expect(getIds(firstPage)).toEqual(['b', 'c']);
    expect(firstPage.hasNextPage).toBe(true);

    const secondPage = paginateByName({
      direction: 'ASC',
      limit: 2,
      after: firstPage.entries[1].cursor,
    });

    expect(getIds(secondPage)).toEqual(['d', 'a']);
    expect(secondPage.hasNextPage).toBe(false);
  });

  it('should continue from the cursor value when the cursor item is gone', () => {
    const firstPage = paginateByName({ direction: 'ASC', limit: 1 });

    const secondPage = paginateMetadataItemsByKeyset({
      items: items.filter(({ id }) => id !== 'b'),
      limit: 2,
      after: firstPage.entries[0].cursor,
      direction: 'ASC',
      getSortValue: ({ name }) => name,
      compareSortValues: (firstSortValue, secondSortValue) =>
        firstSortValue.localeCompare(secondSortValue),
    });

    expect(getIds(secondPage)).toEqual(['c', 'd']);
  });

  it('should throw on a malformed cursor', () => {
    expect(() =>
      paginateByName({ direction: 'ASC', after: '%%%not-a-cursor%%%' }),
    ).toThrow();
  });
});
