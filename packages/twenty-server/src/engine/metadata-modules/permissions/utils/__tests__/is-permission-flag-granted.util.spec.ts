import {
  PermissionFlagType,
  SystemPermissionFlag,
  TOOL_PERMISSION_FLAGS,
} from 'twenty-shared/constants';

import { PERMISSION_FLAG_PERMISSION_TYPE_BY_PERMISSION_FLAG } from 'src/engine/metadata-modules/permissions/constants/permission-flag-permission-type-by-permission-flag.constant';
import { isPermissionFlagGranted } from 'src/engine/metadata-modules/permissions/utils/is-permission-flag-granted.util';

const NO_ROLE_WIDE_ACCESS = {
  canUpdateAllSettings: false,
  canAccessAllTools: false,
};

const NOTHING_ASSIGNED = () => false;

describe('isPermissionFlagGranted', () => {
  it('grants settings flags through canUpdateAllSettings only', () => {
    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canUpdateAllSettings: true },
        permissionFlag: PermissionFlagType.DATA_MODEL,
        isPermissionFlagAssignedToRole: NOTHING_ASSIGNED,
      }),
    ).toBe(true);

    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canAccessAllTools: true },
        permissionFlag: PermissionFlagType.DATA_MODEL,
        isPermissionFlagAssignedToRole: NOTHING_ASSIGNED,
      }),
    ).toBe(false);
  });

  it('grants tool flags through canAccessAllTools only', () => {
    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canAccessAllTools: true },
        permissionFlag: PermissionFlagType.SEND_EMAIL_TOOL,
        isPermissionFlagAssignedToRole: NOTHING_ASSIGNED,
      }),
    ).toBe(true);

    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canUpdateAllSettings: true },
        permissionFlag: PermissionFlagType.SEND_EMAIL_TOOL,
        isPermissionFlagAssignedToRole: NOTHING_ASSIGNED,
      }),
    ).toBe(false);
  });

  it('grants a flag explicitly assigned to the role', () => {
    const assignedPermissionFlagUniversalIdentifiers = new Set<string>([
      SystemPermissionFlag[PermissionFlagType.WORKFLOWS],
    ]);
    const isPermissionFlagAssignedToRole = (
      permissionFlagUniversalIdentifier: string,
    ) =>
      assignedPermissionFlagUniversalIdentifiers.has(
        permissionFlagUniversalIdentifier,
      );

    expect(
      isPermissionFlagGranted({
        role: NO_ROLE_WIDE_ACCESS,
        permissionFlag: PermissionFlagType.WORKFLOWS,
        isPermissionFlagAssignedToRole,
      }),
    ).toBe(true);

    expect(
      isPermissionFlagGranted({
        role: NO_ROLE_WIDE_ACCESS,
        permissionFlag: PermissionFlagType.ROLES,
        isPermissionFlagAssignedToRole,
      }),
    ).toBe(false);
  });

  it('skips the assigned flags lookup when role-wide access grants the flag', () => {
    const isPermissionFlagAssignedToRole = jest.fn(() => false);

    expect(
      isPermissionFlagGranted({
        role: { ...NO_ROLE_WIDE_ACCESS, canUpdateAllSettings: true },
        permissionFlag: PermissionFlagType.WORKSPACE,
        isPermissionFlagAssignedToRole,
      }),
    ).toBe(true);
    expect(isPermissionFlagAssignedToRole).not.toHaveBeenCalled();
  });

  it('classifies exactly the shared tool flags as tool flags', () => {
    const toolPermissionFlags = Object.values(PermissionFlagType).filter(
      (permissionFlag) =>
        PERMISSION_FLAG_PERMISSION_TYPE_BY_PERMISSION_FLAG[permissionFlag] ===
        'tool',
    );

    expect([...toolPermissionFlags].sort()).toEqual(
      [...TOOL_PERMISSION_FLAGS].sort(),
    );
  });

  it('denies a flag it cannot classify', () => {
    const unknownPermissionFlag = 'UNKNOWN_FLAG' as PermissionFlagType;

    expect(
      isPermissionFlagGranted({
        role: { canUpdateAllSettings: true, canAccessAllTools: true },
        permissionFlag: unknownPermissionFlag,
        isPermissionFlagAssignedToRole: NOTHING_ASSIGNED,
      }),
    ).toBe(false);
  });
});
