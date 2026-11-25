import { removeDisabledOperationsFromRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/remove-disabled-operations-from-row-level-permission-rule.util';

const ALL_OPERATIONS_ALLOWED = {
  canCreateRecords: true,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
};

describe('removeDisabledOperationsFromRowLevelPermissionRule', () => {
  it('should keep every operation on an object without disabled actions', () => {
    expect(
      removeDisabledOperationsFromRowLevelPermissionRule({
        ruleOperations: ALL_OPERATIONS_ALLOWED,
        flatObjectMetadata: { disabledObjectPermissionActions: null },
      }),
    ).toEqual(ALL_OPERATIONS_ALLOWED);
  });

  it('should refuse the operations disabled on the object', () => {
    expect(
      removeDisabledOperationsFromRowLevelPermissionRule({
        ruleOperations: ALL_OPERATIONS_ALLOWED,
        flatObjectMetadata: {
          disabledObjectPermissionActions: [
            'canUpdateObjectRecords',
            'canDestroyObjectRecords',
          ],
        },
      }),
    ).toEqual({
      ...ALL_OPERATIONS_ALLOWED,
      canUpdateRecords: false,
      canDestroyRecords: false,
    });
  });

  it('should leave an operation that was not sent undefined', () => {
    expect(
      removeDisabledOperationsFromRowLevelPermissionRule({
        ruleOperations: { canReadRecords: true },
        flatObjectMetadata: { disabledObjectPermissionActions: null },
      }).canUpdateRecords,
    ).toBeUndefined();
  });
});
