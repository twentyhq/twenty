import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { doesRoleRequireCustomRolesEntitlement } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/does-role-require-custom-roles-entitlement.util';

const CUSTOM_ROLE = {
  universalIdentifier: '6f1c2a54-91d3-4b7e-a0f2-3c8d5e7b9a10',
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: true,
};

describe('doesRoleRequireCustomRolesEntitlement', () => {
  it('should require it for a role only API keys can be assigned', () => {
    expect(
      doesRoleRequireCustomRolesEntitlement({
        ...CUSTOM_ROLE,
        canBeAssignedToUsers: false,
      }),
    ).toBe(true);
  });

  it('should not require it for Member', () => {
    expect(
      doesRoleRequireCustomRolesEntitlement({
        ...CUSTOM_ROLE,
        universalIdentifier: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(false);
  });
});
