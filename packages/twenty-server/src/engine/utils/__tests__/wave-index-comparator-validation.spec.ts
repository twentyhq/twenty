import { areIndexDefinitionsEquivalent } from '../are-index-definitions-equivalent';

describe('Wave 1: Index Definitions Comparator Edge Validation', () => {
  it('should treat identical single-column index definitions with matching orders as equivalent', () => {
    const idxA = { columns: [{ name: 'createdAt', order: 'DESC' }] };
    const idxB = { columns: [{ name: 'createdAt', order: 'DESC' }] };
    expect(areIndexDefinitionsEquivalent(idxA as any, idxB as any)).toBe(true);
  });

  it('should detect differences in composite index ordering correctly', () => {
    const idxA = { columns: [{ name: 'workspaceId', order: 'ASC' }, { name: 'position', order: 'DESC' }] };
    const idxB = { columns: [{ name: 'workspaceId', order: 'ASC' }, { name: 'position', order: 'ASC' }] };
    expect(areIndexDefinitionsEquivalent(idxA as any, idxB as any)).toBe(false);
  });

  it('should return true for empty column configurations when both are blank', () => {
    const idxA = { columns: [] };
    const idxB = { columns: [] };
    expect(areIndexDefinitionsEquivalent(idxA as any, idxB as any)).toBe(true);
  });
});
