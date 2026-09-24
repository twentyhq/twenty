import { sortViewSortsByCreation } from 'src/engine/metadata-modules/flat-view/utils/sort-view-sorts-by-creation.util';

describe('sortViewSortsByCreation', () => {
  it('orders view sorts by creation date, whatever order the rows came in', () => {
    const viewSorts = [
      { id: 'c', createdAt: new Date('2026-01-03T00:00:00.000Z') },
      { id: 'a', createdAt: new Date('2026-01-01T00:00:00.000Z') },
      { id: 'b', createdAt: new Date('2026-01-02T00:00:00.000Z') },
    ];

    expect(sortViewSortsByCreation(viewSorts).map(({ id }) => id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('breaks creation date ties by id', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    expect(
      sortViewSortsByCreation([
        { id: 'b', createdAt },
        { id: 'a', createdAt },
      ]).map(({ id }) => id),
    ).toEqual(['a', 'b']);
  });

  it('does not mutate the input', () => {
    const viewSorts = [
      { id: 'b', createdAt: new Date('2026-01-02T00:00:00.000Z') },
      { id: 'a', createdAt: new Date('2026-01-01T00:00:00.000Z') },
    ];

    sortViewSortsByCreation(viewSorts);

    expect(viewSorts.map(({ id }) => id)).toEqual(['b', 'a']);
  });
});
