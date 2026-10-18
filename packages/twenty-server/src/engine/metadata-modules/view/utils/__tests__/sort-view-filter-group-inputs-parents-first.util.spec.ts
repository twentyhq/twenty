import { sortViewFilterGroupInputsParentsFirst } from 'src/engine/metadata-modules/view/utils/sort-view-filter-group-inputs-parents-first.util';

describe('sortViewFilterGroupInputsParentsFirst', () => {
  it('should place every parent before its children', () => {
    const sortedIds = sortViewFilterGroupInputsParentsFirst([
      { id: 'grandchild', parentViewFilterGroupId: 'child' },
      { id: 'child', parentViewFilterGroupId: 'root' },
      { id: 'root' },
      { id: 'sibling', parentViewFilterGroupId: 'root' },
    ]).map((inputGroup) => inputGroup.id);

    expect(sortedIds).toEqual(['root', 'child', 'grandchild', 'sibling']);
  });

  it('should keep groups whose parent is not in the input', () => {
    const sortedIds = sortViewFilterGroupInputsParentsFirst([
      { id: 'child', parentViewFilterGroupId: 'existing-group' },
      { id: 'root' },
    ]).map((inputGroup) => inputGroup.id);

    expect(sortedIds).toEqual(['child', 'root']);
  });

  it('should not loop forever on a parent cycle', () => {
    const sortedIds = sortViewFilterGroupInputsParentsFirst([
      { id: 'first', parentViewFilterGroupId: 'second' },
      { id: 'second', parentViewFilterGroupId: 'first' },
    ]).map((inputGroup) => inputGroup.id);

    expect(sortedIds).toHaveLength(2);
  });
});
