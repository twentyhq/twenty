import { RelationOnDeleteAction } from 'twenty-shared/types';

import { computeForeignKeyOnDelete } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/compute-foreign-key-on-delete.util';

describe('computeForeignKeyOnDelete', () => {
  it('should default to CASCADE when onDelete is undefined', () => {
    expect(computeForeignKeyOnDelete(undefined)).toBe('CASCADE');
  });

  it('should map SET_NULL to SET NULL', () => {
    expect(computeForeignKeyOnDelete(RelationOnDeleteAction.SET_NULL)).toBe(
      'SET NULL',
    );
  });

  it.each([
    [undefined, RelationOnDeleteAction.SET_NULL, true],
    [undefined, RelationOnDeleteAction.CASCADE, false],
    [RelationOnDeleteAction.SET_NULL, RelationOnDeleteAction.CASCADE, true],
  ])(
    'should detect a foreign key change from %s to %s: %s',
    (fromOnDelete, toOnDelete, expectedHasChanged) => {
      expect(
        computeForeignKeyOnDelete(fromOnDelete) !==
          computeForeignKeyOnDelete(toOnDelete),
      ).toBe(expectedHasChanged);
    },
  );
});
