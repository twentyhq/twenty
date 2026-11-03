import { getNestedPredicateGroupOperationErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-nested-predicate-group-operation-errors.util';

const NO_OPERATIONS = {
  canReadRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

describe('getNestedPredicateGroupOperationErrors', () => {
  it('lets a root group grant operations', () => {
    expect(
      getNestedPredicateGroupOperationErrors({
        flatPredicateGroup: {
          ...NO_OPERATIONS,
          canReadRecords: true,
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

  it('rejects a nested group that grants an operation', () => {
    expect(
      getNestedPredicateGroupOperationErrors({
        flatPredicateGroup: {
          ...NO_OPERATIONS,
          canDestroyRecords: true,
          parentRowLevelPermissionPredicateGroupUniversalIdentifier:
            'parent-group',
        },
      }),
    ).toHaveLength(1);
  });
});
