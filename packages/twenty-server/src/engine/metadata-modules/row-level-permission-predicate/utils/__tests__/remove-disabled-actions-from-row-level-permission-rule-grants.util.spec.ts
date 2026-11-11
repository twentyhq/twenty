import { removeDisabledActionsFromRowLevelPermissionRuleGrants } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/remove-disabled-actions-from-row-level-permission-rule-grants.util';

const ALL_GRANTED = {
  canCreateRecords: true,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
};

describe('removeDisabledActionsFromRowLevelPermissionRuleGrants', () => {
  it('should keep every grant on an object without disabled actions', () => {
    expect(
      removeDisabledActionsFromRowLevelPermissionRuleGrants({
        ruleGrants: ALL_GRANTED,
        flatObjectMetadata: { disabledObjectPermissionActions: null },
      }),
    ).toEqual(ALL_GRANTED);
  });

  it('should refuse the grants of actions disabled on the object', () => {
    expect(
      removeDisabledActionsFromRowLevelPermissionRuleGrants({
        ruleGrants: ALL_GRANTED,
        flatObjectMetadata: {
          disabledObjectPermissionActions: [
            'canUpdateObjectRecords',
            'canDestroyObjectRecords',
          ],
        },
      }),
    ).toEqual({
      ...ALL_GRANTED,
      canUpdateRecords: false,
      canDestroyRecords: false,
    });
  });

  it('should leave a grant that was not sent undefined', () => {
    expect(
      removeDisabledActionsFromRowLevelPermissionRuleGrants({
        ruleGrants: { canReadRecords: true },
        flatObjectMetadata: { disabledObjectPermissionActions: null },
      }).canUpdateRecords,
    ).toBeUndefined();
  });
});
