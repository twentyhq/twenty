import { sortViewGroupsByPosition } from 'src/engine/metadata-modules/flat-view/utils/sort-view-groups-by-position.util';

describe('sortViewGroupsByPosition', () => {
  it('orders groups by position regardless of input order', () => {
    expect(
      sortViewGroupsByPosition([
        { id: 'last-group', position: 2 },
        { id: 'first-group', position: 0 },
        { id: 'middle-group', position: 1 },
      ]).map(({ id }) => id),
    ).toEqual(['first-group', 'middle-group', 'last-group']);
  });

  it('orders groups sharing a position by ID', () => {
    expect(
      sortViewGroupsByPosition([
        { id: 'group-b', position: 1 },
        { id: 'group-a', position: 1 },
      ]).map(({ id }) => id),
    ).toEqual(['group-a', 'group-b']);
  });

  it('leaves the supplied array unchanged', () => {
    const viewGroups = [
      { id: 'last-group', position: 1 },
      { id: 'first-group', position: 0 },
    ];

    sortViewGroupsByPosition(viewGroups);

    expect(viewGroups.map(({ id }) => id)).toEqual([
      'last-group',
      'first-group',
    ]);
  });
});
