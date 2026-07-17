import { computeRowsContentHash } from 'src/engine/workspace-cache/utils/compute-rows-content-hash.util';

describe('computeRowsContentHash', () => {
  const rowA = {
    id: 'a',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  };
  const rowB = {
    id: 'b',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
  };

  it('should be stable across row ordering', () => {
    expect(computeRowsContentHash({ section: [rowA, rowB] })).toBe(
      computeRowsContentHash({ section: [rowB, rowA] }),
    );
  });

  it('should be stable across section insertion order', () => {
    expect(computeRowsContentHash({ alpha: [rowA], beta: [rowB] })).toBe(
      computeRowsContentHash({ beta: [rowB], alpha: [rowA] }),
    );
  });

  it('should treat dates and their ISO string form identically', () => {
    expect(
      computeRowsContentHash({
        section: [{ id: 'a', updatedAt: new Date('2026-01-01T00:00:00.000Z') }],
      }),
    ).toBe(
      computeRowsContentHash({
        section: [{ id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' }],
      }),
    );
  });

  it('should change when a row is updated', () => {
    expect(
      computeRowsContentHash({
        section: [{ ...rowA, updatedAt: '2026-01-03T00:00:00.000Z' }],
      }),
    ).not.toBe(computeRowsContentHash({ section: [rowA] }));
  });

  it('should change when a row is soft deleted', () => {
    expect(
      computeRowsContentHash({
        section: [{ ...rowA, deletedAt: '2026-01-03T00:00:00.000Z' }],
      }),
    ).not.toBe(computeRowsContentHash({ section: [rowA] }));
  });

  it('should change when a row is added', () => {
    expect(computeRowsContentHash({ section: [rowA, rowB] })).not.toBe(
      computeRowsContentHash({ section: [rowA] }),
    );
  });

  it('should distinguish which section a row belongs to', () => {
    expect(computeRowsContentHash({ alpha: [rowA], beta: [] })).not.toBe(
      computeRowsContentHash({ alpha: [], beta: [rowA] }),
    );
  });
});
