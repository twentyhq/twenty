import { buildUniqueRelationLabels } from 'src/modules/dashboard/chart-data/utils/build-unique-relation-labels.util';

describe('buildUniqueRelationLabels', () => {
  it('should keep unique labels untouched', () => {
    const { labelByRecordId, unresolvedRecordIds } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([
        ['id-1', 'Alice'],
        ['id-2', 'Bob'],
      ]),
      allRecordIds: ['id-1', 'id-2'],
    });

    expect(labelByRecordId.get('id-1')).toBe('Alice');
    expect(labelByRecordId.get('id-2')).toBe('Bob');
    expect(unresolvedRecordIds.size).toBe(0);
  });

  it('should suffix every member of a colliding label group', () => {
    const { labelByRecordId } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([
        ['id-1', 'John Smith'],
        ['id-2', 'John Smith'],
        ['id-3', 'Maria'],
      ]),
      allRecordIds: ['id-1', 'id-2', 'id-3'],
    });

    expect(labelByRecordId.get('id-1')).toBe('John Smith (1)');
    expect(labelByRecordId.get('id-2')).toBe('John Smith (2)');
    expect(labelByRecordId.get('id-3')).toBe('Maria');
  });

  it('should assign ordinals by ascending record id regardless of input order', () => {
    const resolutionFromShuffledInput = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([
        ['id-b', 'John Smith'],
        ['id-a', 'John Smith'],
      ]),
      allRecordIds: ['id-b', 'id-a'],
    });

    expect(resolutionFromShuffledInput.labelByRecordId.get('id-a')).toBe(
      'John Smith (1)',
    );
    expect(resolutionFromShuffledInput.labelByRecordId.get('id-b')).toBe(
      'John Smith (2)',
    );
  });

  it('should classify missing labels as unresolved without assigning a label', () => {
    const { labelByRecordId, unresolvedRecordIds } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([['id-1', 'Alice']]),
      allRecordIds: ['id-1', 'id-2'],
    });

    expect(labelByRecordId.has('id-2')).toBe(false);
    expect(unresolvedRecordIds).toEqual(new Set(['id-2']));
  });

  it('should classify every record with no label as unresolved', () => {
    const allRecordIds = Array.from(
      { length: 11 },
      (_, index) => `id-${String(index).padStart(2, '0')}`,
    );

    const { labelByRecordId, unresolvedRecordIds } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map(),
      allRecordIds,
    });

    expect(unresolvedRecordIds.size).toBe(11);
    expect(labelByRecordId.size).toBe(0);
  });

  it('should classify whitespace-only labels as unresolved', () => {
    const { labelByRecordId, unresolvedRecordIds } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([['id-1', '   ']]),
      allRecordIds: ['id-1'],
    });

    expect(labelByRecordId.has('id-1')).toBe(false);
    expect(unresolvedRecordIds).toEqual(new Set(['id-1']));
  });

  it('should suffix records genuinely named like the sentinels', () => {
    const { labelByRecordId } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([
        ['id-1', 'Unknown'],
        ['id-2', 'Not Set'],
      ]),
      allRecordIds: ['id-1', 'id-2'],
    });

    expect(labelByRecordId.get('id-1')).toBe('Unknown (1)');
    expect(labelByRecordId.get('id-2')).toBe('Not Set (1)');
  });

  it('should not reuse a label already taken by a suffixed record', () => {
    const { labelByRecordId } = buildUniqueRelationLabels({
      rawLabelByRecordId: new Map([
        ['id-1', 'John Smith'],
        ['id-2', 'John Smith'],
        ['id-3', 'John Smith (1)'],
      ]),
      allRecordIds: ['id-1', 'id-2', 'id-3'],
    });

    const assignedLabels = [...labelByRecordId.values()];

    expect(new Set(assignedLabels).size).toBe(assignedLabels.length);
  });
});
