import { PermissionFlagType } from 'twenty-shared/constants';

import { hasRoleWideAccessToPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/has-role-wide-access-to-permission-flag.util';

describe('hasRoleWideAccessToPermissionFlag', () => {
  it('grants settings flags through canUpdateAllSettings only', () => {
    expect(
      hasRoleWideAccessToPermissionFlag({
        role: { canUpdateAllSettings: true, canAccessAllTools: false },
        permissionFlag: PermissionFlagType.DATA_MODEL,
      }),
    ).toBe(true);

    expect(
      hasRoleWideAccessToPermissionFlag({
        role: { canUpdateAllSettings: false, canAccessAllTools: true },
        permissionFlag: PermissionFlagType.DATA_MODEL,
      }),
    ).toBe(false);
  });

  it('grants tool flags through canAccessAllTools only', () => {
    expect(
      hasRoleWideAccessToPermissionFlag({
        role: { canUpdateAllSettings: false, canAccessAllTools: true },
        permissionFlag: PermissionFlagType.SEND_EMAIL_TOOL,
      }),
    ).toBe(true);

    expect(
      hasRoleWideAccessToPermissionFlag({
        role: { canUpdateAllSettings: true, canAccessAllTools: false },
        permissionFlag: PermissionFlagType.SEND_EMAIL_TOOL,
      }),
    ).toBe(false);
  });
});
