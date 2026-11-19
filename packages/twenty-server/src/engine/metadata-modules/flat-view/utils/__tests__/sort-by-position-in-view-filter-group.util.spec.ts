import { sortByPositionInViewFilterGroup } from 'src/engine/metadata-modules/flat-view/utils/sort-by-position-in-view-filter-group.util';

describe('sortByPositionInViewFilterGroup', () => {
  it('orders rows by position regardless of input order', () => {
    expect(
      sortByPositionInViewFilterGroup([
        { id: 'last-filter', positionInViewFilterGroup: 2 },
        { id: 'first-filter', positionInViewFilterGroup: 0 },
        { id: 'middle-filter', positionInViewFilterGroup: 1 },
      ]).map(({ id }) => id),
    ).toEqual(['first-filter', 'middle-filter', 'last-filter']);
  });

  it('puts rows without a position last', () => {
    expect(
      sortByPositionInViewFilterGroup([
        { id: 'null-position', positionInViewFilterGroup: null },
        { id: 'missing-position' },
        { id: 'positioned', positionInViewFilterGroup: 5 },
      ]).map(({ id }) => id),
    ).toEqual(['positioned', 'missing-position', 'null-position']);
  });

  it('orders rows sharing a position by ID', () => {
    expect(
      sortByPositionInViewFilterGroup([
        { id: 'filter-b', positionInViewFilterGroup: 1 },
        { id: 'filter-a', positionInViewFilterGroup: 1 },
      ]).map(({ id }) => id),
    ).toEqual(['filter-a', 'filter-b']);
  });

  it('leaves the supplied array unchanged', () => {
    const viewFilters = [
      { id: 'last-filter', positionInViewFilterGroup: 1 },
      { id: 'first-filter', positionInViewFilterGroup: 0 },
    ];

    sortByPositionInViewFilterGroup(viewFilters);

    expect(viewFilters.map(({ id }) => id)).toEqual([
      'last-filter',
      'first-filter',
    ]);
  });
});
