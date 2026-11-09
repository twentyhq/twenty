import { SystemPermissionFlag } from 'twenty-shared/constants';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { FlatRolePermissionFlagValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-permission-flag-validator.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'scheduling-app';
const ROLE_UNIVERSAL_IDENTIFIER = 'scheduling-app-default-role';
const UNKNOWN_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000d4';

const FLAT_ROLE: UniversalFlatRole = {
  universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  isEditable: true,
  label: 'Scheduling app',
  description: null,
  icon: null,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  canBeAssignedToApplications: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  fieldPermissionUniversalIdentifiers: [],
  objectPermissionUniversalIdentifiers: [],
  roleTargetUniversalIdentifiers: [],
  agentChatChannelRoleUniversalIdentifiers: [],
  rolePermissionFlagUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
};

const buildCreationArgs = (permissionFlagUniversalIdentifier: string) => ({
  flatEntityToValidate: {
    universalIdentifier: 'role-permission-flag',
    roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
    permissionFlagUniversalIdentifier,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatPermissionFlagMaps: { byUniversalIdentifier: {} },
    flatRolePermissionFlagMaps: { byUniversalIdentifier: {} },
    flatRoleMaps: {
      byUniversalIdentifier: { [ROLE_UNIVERSAL_IDENTIFIER]: FLAT_ROLE },
    },
  },
  buildOptions: {
    isSystemBuild: false,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
  },
});

describe('FlatRolePermissionFlagValidatorService', () => {
  const validator = new FlatRolePermissionFlagValidatorService();

  it('names the missing standard permission flag when a workspace lacks it', () => {
    const { errors } = validator.validateFlatRolePermissionFlagCreation(
      buildCreationArgs(SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(PermissionsExceptionCode.INVALID_SETTING);
    expect(errors[0].message).toBe(
      `Standard permission flag CREATE_CALENDAR_EVENT_TOOL (${SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL}) not found in this workspace. Run the workspace upgrade to create it.`,
    );
    expect(errors[0].userFriendlyMessage?.values).toEqual({
      permissionFlagName: 'CREATE_CALENDAR_EVENT_TOOL',
    });
  });

  it('names the missing permission flag by universal identifier when it is not a standard one', () => {
    const { errors } = validator.validateFlatRolePermissionFlagCreation(
      buildCreationArgs(UNKNOWN_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      `Permission flag ${UNKNOWN_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER} not found in this workspace`,
    );
  });
});
