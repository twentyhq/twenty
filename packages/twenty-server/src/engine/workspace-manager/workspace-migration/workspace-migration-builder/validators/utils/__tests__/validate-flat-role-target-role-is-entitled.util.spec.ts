import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { validateFlatRoleTargetRoleIsEntitled } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-role-is-entitled.util';

const CUSTOM_ROLE = {
  universalIdentifier: '6f1c2a54-91d3-4b7e-a0f2-3c8d5e7b9a10',
  label: 'Sales',
};

const USER_ROLE_TARGET = { agentUniversalIdentifier: null };

const USER_BUILD_OPTIONS = {
  isSystemBuild: false,
  applicationUniversalIdentifier: 'workspace-custom-application',
};

describe('validateFlatRoleTargetRoleIsEntitled', () => {
  it.each([
    ['Admin', STANDARD_ROLE.admin.universalIdentifier],
    ['Member', MEMBER_ROLE_UNIVERSAL_IDENTIFIER],
  ])(
    'should allow %s without the entitlement',
    (label, universalIdentifier) => {
      expect(
        validateFlatRoleTargetRoleIsEntitled({
          flatRole: { universalIdentifier, label },
          flatRoleTarget: USER_ROLE_TARGET,
          billingEntitlements: {},
          buildOptions: USER_BUILD_OPTIONS,
        }),
      ).toBeUndefined();
    },
  );

  it('should allow a custom role when the workspace is entitled', () => {
    expect(
      validateFlatRoleTargetRoleIsEntitled({
        flatRole: CUSTOM_ROLE,
        flatRoleTarget: USER_ROLE_TARGET,
        billingEntitlements: { [BillingEntitlementKey.CUSTOM_ROLES]: true },
        buildOptions: USER_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow a custom role in a system build', () => {
    expect(
      validateFlatRoleTargetRoleIsEntitled({
        flatRole: CUSTOM_ROLE,
        flatRoleTarget: USER_ROLE_TARGET,
        billingEntitlements: {},
        buildOptions: { ...USER_BUILD_OPTIONS, isSystemBuild: true },
      }),
    ).toBeUndefined();
  });

  it('should allow a custom role on an agent without the entitlement', () => {
    expect(
      validateFlatRoleTargetRoleIsEntitled({
        flatRole: CUSTOM_ROLE,
        flatRoleTarget: { agentUniversalIdentifier: 'agent-universal-id' },
        billingEntitlements: {},
        buildOptions: USER_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it.each([
    ['revoked', { [BillingEntitlementKey.CUSTOM_ROLES]: false }],
    ['missing', {}],
  ])(
    'should refuse a custom role when the entitlement is %s',
    (_, billingEntitlements) => {
      expect(
        validateFlatRoleTargetRoleIsEntitled({
          flatRole: CUSTOM_ROLE,
          flatRoleTarget: USER_ROLE_TARGET,
          billingEntitlements,
          buildOptions: USER_BUILD_OPTIONS,
        })?.code,
      ).toBe(RoleTargetExceptionCode.CUSTOM_ROLES_NOT_ENTITLED);
    },
  );
});
