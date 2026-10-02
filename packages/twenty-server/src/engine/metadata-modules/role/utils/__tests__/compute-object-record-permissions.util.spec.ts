import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  type ComputeObjectRecordPermissionsArgs,
  computeObjectRecordPermissions,
} from 'src/engine/metadata-modules/role/utils/compute-object-record-permissions.util';

const NO_ACCESS_ROLE: ComputeObjectRecordPermissionsArgs['role'] = {
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
};

const FULL_RECORD_ACCESS_ROLE: ComputeObjectRecordPermissionsArgs['role'] = {
  ...NO_ACCESS_ROLE,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
};

const DENY_ALL_OVERRIDE = {
  canReadObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

const ALL_RECORD_PERMISSIONS = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
};

const NO_RECORD_PERMISSIONS = {
  canReadObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

const customObject = {
  isSystem: false,
  universalIdentifier: 'custom-object-universal-identifier',
};

const flags = (...permissionFlags: PermissionFlagType[]) =>
  new Set(
    permissionFlags.map(
      (permissionFlag) => SystemPermissionFlag[permissionFlag],
    ),
  );

describe('computeObjectRecordPermissions', () => {
  describe('regular objects', () => {
    it('falls back to the role-wide permissions without an override', () => {
      expect(
        computeObjectRecordPermissions({
          role: { ...NO_ACCESS_ROLE, canReadAllObjectRecords: true },
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: customObject,
        }),
      ).toEqual({
        objectRecordPermissions: {
          ...NO_RECORD_PERMISSIONS,
          canReadObjectRecords: true,
        },
        appliesFieldPermissions: true,
      });
    });

    it('applies non-null override values and keeps role values for null ones', () => {
      expect(
        computeObjectRecordPermissions({
          role: FULL_RECORD_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: customObject,
          objectPermissionOverride: {
            canReadObjectRecords: null,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: undefined,
            canDestroyObjectRecords: false,
          },
        }).objectRecordPermissions,
      ).toEqual({
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      });
    });
  });

  describe('system objects', () => {
    it('grants every record operation by default, whatever the role says', () => {
      expect(
        computeObjectRecordPermissions({
          role: NO_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: { ...customObject, isSystem: true },
        }).objectRecordPermissions,
      ).toEqual(ALL_RECORD_PERMISSIONS);
    });

    it('still honors object overrides', () => {
      expect(
        computeObjectRecordPermissions({
          role: FULL_RECORD_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: { ...customObject, isSystem: true },
          objectPermissionOverride: DENY_ALL_OVERRIDE,
        }).objectRecordPermissions,
      ).toEqual(NO_RECORD_PERMISSIONS);
    });
  });

  describe.each([
    ['workflow', STANDARD_OBJECTS.workflow.universalIdentifier],
    ['workflowRun', STANDARD_OBJECTS.workflowRun.universalIdentifier],
    ['workflowVersion', STANDARD_OBJECTS.workflowVersion.universalIdentifier],
  ])('%s object', (_objectName, universalIdentifier) => {
    const workflowObject = { isSystem: true, universalIdentifier };

    it('ignores object overrides and field permissions for settings administrators', () => {
      expect(
        computeObjectRecordPermissions({
          role: { ...NO_ACCESS_ROLE, canUpdateAllSettings: true },
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: workflowObject,
          objectPermissionOverride: DENY_ALL_OVERRIDE,
        }),
      ).toEqual({
        objectRecordPermissions: ALL_RECORD_PERMISSIONS,
        appliesFieldPermissions: false,
      });
    });

    it('grants record access through the WORKFLOWS permission flag', () => {
      expect(
        computeObjectRecordPermissions({
          role: NO_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(
            PermissionFlagType.WORKFLOWS,
          ),
          objectMetadata: workflowObject,
        }).objectRecordPermissions,
      ).toEqual(ALL_RECORD_PERMISSIONS);
    });

    it('denies record access without the setting, even with full record access', () => {
      expect(
        computeObjectRecordPermissions({
          role: FULL_RECORD_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(
            PermissionFlagType.WORKSPACE_MEMBERS,
          ),
          objectMetadata: workflowObject,
        }).objectRecordPermissions,
      ).toEqual(NO_RECORD_PERMISSIONS);
    });
  });

  describe('workspaceMember object', () => {
    const workspaceMemberObject = {
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    };

    it('is always readable, ignores object overrides and keeps field permissions', () => {
      expect(
        computeObjectRecordPermissions({
          role: FULL_RECORD_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: workspaceMemberObject,
          objectPermissionOverride: DENY_ALL_OVERRIDE,
        }),
      ).toEqual({
        objectRecordPermissions: {
          ...NO_RECORD_PERMISSIONS,
          canReadObjectRecords: true,
        },
        appliesFieldPermissions: true,
      });
    });

    it('grants write operations through the WORKSPACE_MEMBERS permission flag', () => {
      expect(
        computeObjectRecordPermissions({
          role: NO_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(
            PermissionFlagType.WORKSPACE_MEMBERS,
          ),
          objectMetadata: workspaceMemberObject,
        }).objectRecordPermissions,
      ).toEqual(ALL_RECORD_PERMISSIONS);
    });

    it('grants write operations to settings administrators', () => {
      expect(
        computeObjectRecordPermissions({
          role: { ...NO_ACCESS_ROLE, canUpdateAllSettings: true },
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: workspaceMemberObject,
        }).objectRecordPermissions,
      ).toEqual(ALL_RECORD_PERMISSIONS);
    });
  });

  describe('agentChatThread object', () => {
    const agentChatThreadObject = {
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    };

    it('denies every record operation without AI access', () => {
      expect(
        computeObjectRecordPermissions({
          role: { ...FULL_RECORD_ACCESS_ROLE, canUpdateAllSettings: true },
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: agentChatThreadObject,
        }).objectRecordPermissions,
      ).toEqual(NO_RECORD_PERMISSIONS);
    });

    it('grants the system object defaults with the AI permission flag', () => {
      expect(
        computeObjectRecordPermissions({
          role: NO_ACCESS_ROLE,
          rolePermissionFlagUniversalIdentifiers: flags(PermissionFlagType.AI),
          objectMetadata: agentChatThreadObject,
        }).objectRecordPermissions,
      ).toEqual(ALL_RECORD_PERMISSIONS);
    });

    it('keeps object override denials for roles with canAccessAllTools', () => {
      expect(
        computeObjectRecordPermissions({
          role: { ...NO_ACCESS_ROLE, canAccessAllTools: true },
          rolePermissionFlagUniversalIdentifiers: flags(),
          objectMetadata: agentChatThreadObject,
          objectPermissionOverride: {
            ...DENY_ALL_OVERRIDE,
            canReadObjectRecords: true,
          },
        }),
      ).toEqual({
        objectRecordPermissions: {
          ...NO_RECORD_PERMISSIONS,
          canReadObjectRecords: true,
        },
        appliesFieldPermissions: true,
      });
    });
  });
});
