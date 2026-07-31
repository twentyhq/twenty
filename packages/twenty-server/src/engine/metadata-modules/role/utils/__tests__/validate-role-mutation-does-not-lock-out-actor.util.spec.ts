import { SystemPermissionFlag } from 'twenty-shared/constants';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  validateRoleDeletionDoesNotLockOutActorOrThrow,
  validateRoleUpdateDoesNotLockOutActorOrThrow,
} from 'src/engine/metadata-modules/role/utils/validate-role-mutation-does-not-lock-out-actor.util';

const actingRoleId = 'acting-role-id';

const createFlatRole = (overrides: Partial<FlatRole>): FlatRole =>
  ({
    id: actingRoleId,
    label: 'Manager',
    isEditable: true,
    canUpdateAllSettings: true,
    rolePermissionFlagIds: [],
    ...overrides,
  }) as FlatRole;

const emptyFlagMaps = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
} as unknown as FlatRolePermissionFlagMaps;

describe('validateRoleDeletionDoesNotLockOutActorOrThrow', () => {
  it('throws when deleting a role the actor holds', () => {
    expect(() =>
      validateRoleDeletionDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({}),
        actingRoleIds: [actingRoleId],
      }),
    ).toThrow(PermissionsException);
  });

  it('allows deleting a role the actor does not hold', () => {
    expect(() =>
      validateRoleDeletionDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({ id: 'other-role-id' }),
        actingRoleIds: [actingRoleId],
      }),
    ).not.toThrow();
  });

  it('allows deletion when no acting roles are provided (system caller)', () => {
    expect(() =>
      validateRoleDeletionDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({}),
        actingRoleIds: undefined,
      }),
    ).not.toThrow();
  });
});

describe('validateRoleUpdateDoesNotLockOutActorOrThrow', () => {
  it('throws when revoking settings access from a role the actor holds', () => {
    expect(() =>
      validateRoleUpdateDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({}),
        canUpdateAllSettingsUpdate: false,
        actingRoleIds: [actingRoleId],
        flatRolePermissionFlagMaps: emptyFlagMaps,
      }),
    ).toThrow(PermissionsException);
  });

  it('allows the revocation when the role keeps an explicit ROLES permission flag', () => {
    const rolePermissionFlagId = 'role-permission-flag-id';
    const flagMaps = {
      byUniversalIdentifier: {
        [rolePermissionFlagId]: {
          id: rolePermissionFlagId,
          permissionFlagUniversalIdentifier: SystemPermissionFlag.ROLES,
        },
      },
      universalIdentifierById: {
        [rolePermissionFlagId]: rolePermissionFlagId,
      },
    } as unknown as FlatRolePermissionFlagMaps;

    expect(() =>
      validateRoleUpdateDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({
          rolePermissionFlagIds: [rolePermissionFlagId],
        }),
        canUpdateAllSettingsUpdate: false,
        actingRoleIds: [actingRoleId],
        flatRolePermissionFlagMaps: flagMaps,
      }),
    ).not.toThrow();
  });

  it('allows revoking settings access on a role the actor does not hold', () => {
    expect(() =>
      validateRoleUpdateDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({ id: 'other-role-id' }),
        canUpdateAllSettingsUpdate: false,
        actingRoleIds: [actingRoleId],
        flatRolePermissionFlagMaps: emptyFlagMaps,
      }),
    ).not.toThrow();
  });

  it('allows updates that do not touch settings access', () => {
    expect(() =>
      validateRoleUpdateDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({}),
        canUpdateAllSettingsUpdate: undefined,
        actingRoleIds: [actingRoleId],
        flatRolePermissionFlagMaps: emptyFlagMaps,
      }),
    ).not.toThrow();
  });

  it('allows the update when no acting roles are provided (system caller)', () => {
    expect(() =>
      validateRoleUpdateDoesNotLockOutActorOrThrow({
        flatRole: createFlatRole({}),
        canUpdateAllSettingsUpdate: false,
        actingRoleIds: undefined,
        flatRolePermissionFlagMaps: emptyFlagMaps,
      }),
    ).not.toThrow();
  });
});
