import { RowLevelPermissionPredicateGroupExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate-group.exception';
import { getNestedPredicateGroupOperationErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-nested-predicate-group-operation-errors.util';

const NO_OPERATIONS = {
  canReadRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

const OPERATIONS = [
  'canReadRecords',
  'canUpdateRecords',
  'canSoftDeleteRecords',
  'canDestroyRecords',
] as const;

describe('getNestedPredicateGroupOperationErrors', () => {
  it.each(OPERATIONS)('lets a root group grant %s', (operation) => {
    expect(
      getNestedPredicateGroupOperationErrors({
        flatPredicateGroup: {
          ...NO_OPERATIONS,
          [operation]: true,
          parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
        },
      }),
    ).toEqual([]);
  });

  it('lets a nested group grant nothing', () => {
    expect(
      getNestedPredicateGroupOperationErrors({
        flatPredicateGroup: {
          ...NO_OPERATIONS,
          parentRowLevelPermissionPredicateGroupUniversalIdentifier:
            'parent-group',
        },
      }),
    ).toEqual([]);
  });

  it.each(OPERATIONS)('rejects a nested group that grants %s', (operation) => {
    expect(
      getNestedPredicateGroupOperationErrors({
        flatPredicateGroup: {
          ...NO_OPERATIONS,
          [operation]: true,
          parentRowLevelPermissionPredicateGroupUniversalIdentifier:
            'parent-group',
        },
      }),
    ).toEqual([
      expect.objectContaining({
        code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
      }),
    ]);
  });
});
