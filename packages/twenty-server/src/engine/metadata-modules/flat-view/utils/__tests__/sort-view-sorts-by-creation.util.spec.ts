import { sortViewSortsByCreation } from 'src/engine/metadata-modules/flat-view/utils/sort-view-sorts-by-creation.util';

describe('sortViewSortsByCreation', () => {
  it('gives the oldest sort highest priority regardless of input order', () => {
    const viewSorts = [
      { id: 'newest-sort', createdAt: new Date('2026-01-03T00:00:00.000Z') },
      { id: 'oldest-sort', createdAt: new Date('2026-01-01T00:00:00.000Z') },
      { id: 'middle-sort', createdAt: new Date('2026-01-02T00:00:00.000Z') },
    ];

    expect(sortViewSortsByCreation(viewSorts).map(({ id }) => id)).toEqual([
      'oldest-sort',
      'middle-sort',
      'newest-sort',
    ]);
  });

  it('orders sorts with equal creation timestamps by ID', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    expect(
      sortViewSortsByCreation([
        { id: 'sort-b', createdAt },
        { id: 'sort-a', createdAt },
      ]).map(({ id }) => id),
    ).toEqual(['sort-a', 'sort-b']);
  });

  it('leaves the supplied array unchanged', () => {
    const viewSorts = [
      { id: 'middle-sort', createdAt: new Date('2026-01-02T00:00:00.000Z') },
      { id: 'oldest-sort', createdAt: new Date('2026-01-01T00:00:00.000Z') },
    ];

    sortViewSortsByCreation(viewSorts);

    expect(viewSorts.map(({ id }) => id)).toEqual([
      'middle-sort',
      'oldest-sort',
    ]);
  });
});
