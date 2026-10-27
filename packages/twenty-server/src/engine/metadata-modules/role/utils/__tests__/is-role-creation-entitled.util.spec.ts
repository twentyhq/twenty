import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { isRoleCreationEntitled } from 'src/engine/metadata-modules/role/utils/is-role-creation-entitled.util';

const CUSTOM_ROLE = {
  universalIdentifier: '6f1c2a54-91d3-4b7e-a0f2-3c8d5e7b9a10',
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: true,
};

describe('isRoleCreationEntitled', () => {
  it('should allow a custom role when the workspace is entitled', () => {
    expect(
      isRoleCreationEntitled({
        flatRole: CUSTOM_ROLE,
        billingEntitlements: { [BillingEntitlementKey.CUSTOM_ROLES]: true },
      }),
    ).toBe(true);
  });

  it.each([
    ['users', { canBeAssignedToUsers: true, canBeAssignedToApiKeys: false }],
    ['API keys', { canBeAssignedToUsers: false, canBeAssignedToApiKeys: true }],
  ])(
    'should refuse a role assignable to %s without the entitlement',
    (_target, assignability) => {
      expect(
        isRoleCreationEntitled({
          flatRole: { ...CUSTOM_ROLE, ...assignability },
          billingEntitlements: { [BillingEntitlementKey.CUSTOM_ROLES]: false },
        }),
      ).toBe(false);
    },
  );

  it('should allow an agent-only role without the entitlement', () => {
    expect(
      isRoleCreationEntitled({
        flatRole: {
          ...CUSTOM_ROLE,
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
        },
        billingEntitlements: {},
      }),
    ).toBe(true);
  });

  it('should allow the Member role without the entitlement', () => {
    expect(
      isRoleCreationEntitled({
        flatRole: {
          ...CUSTOM_ROLE,
          universalIdentifier: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
        },
        billingEntitlements: {},
      }),
    ).toBe(true);
  });
});
