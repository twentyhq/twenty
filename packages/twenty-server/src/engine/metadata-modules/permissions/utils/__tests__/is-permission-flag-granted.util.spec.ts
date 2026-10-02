import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { isPermissionFlagGranted } from 'src/engine/metadata-modules/permissions/utils/is-permission-flag-granted.util';

const NO_ROLE_WIDE_ACCESS = {
  canUpdateAllSettings: false,
  canAccessAllTools: false,
};

describe('isPermissionFlagGranted', () => {
  it('grants settings flags through canUpdateAllSettings only', () => {
    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canUpdateAllSettings: true },
        permissionFlag: PermissionFlagType.DATA_MODEL,
        assignedPermissionFlagUniversalIdentifiers: new Set(),
      }),
    ).toBe(true);

    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canAccessAllTools: true },
        permissionFlag: PermissionFlagType.DATA_MODEL,
        assignedPermissionFlagUniversalIdentifiers: new Set(),
      }),
    ).toBe(false);
  });

  it('grants tool flags through canAccessAllTools only', () => {
    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canAccessAllTools: true },
        permissionFlag: PermissionFlagType.SEND_EMAIL_TOOL,
        assignedPermissionFlagUniversalIdentifiers: new Set(),
      }),
    ).toBe(true);

    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canUpdateAllSettings: true },
        permissionFlag: PermissionFlagType.SEND_EMAIL_TOOL,
        assignedPermissionFlagUniversalIdentifiers: new Set(),
      }),
    ).toBe(false);
  });

  it('grants a flag explicitly assigned to the role', () => {
    const assignedPermissionFlagUniversalIdentifiers = new Set([
      SystemPermissionFlag[PermissionFlagType.WORKFLOWS],
    ]);

    expect(
      isPermissionFlagGranted({
        role: NO_ROLE_WIDE_ACCESS,
        permissionFlag: PermissionFlagType.WORKFLOWS,
        assignedPermissionFlagUniversalIdentifiers,
      }),
    ).toBe(true);

    expect(
      isPermissionFlagGranted({
        role: NO_ROLE_WIDE_ACCESS,
        permissionFlag: PermissionFlagType.ROLES,
        assignedPermissionFlagUniversalIdentifiers,
      }),
    ).toBe(false);
  });
});
