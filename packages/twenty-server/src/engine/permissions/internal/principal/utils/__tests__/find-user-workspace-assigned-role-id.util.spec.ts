import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { findUserWorkspaceAssignedRoleId } from 'src/engine/permissions/internal/principal/utils/find-user-workspace-assigned-role-id.util';

const buildFlatRole = (
  flatRole: Pick<FlatRole, 'id' | 'isSystemSideEffect'>,
): FlatRole => ({
  universalIdentifier: `${flatRole.id}-universal-identifier`,
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  label: 'Role',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  description: null,
  icon: null,
  isEditable: true,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
  canBeAssignedToApplications: true,
  roleTargetIds: [],
  rolePermissionFlagIds: [],
  objectPermissionIds: [],
  fieldPermissionIds: [],
  rowLevelPermissionRuleIds: [],
  agentChatChannelRoleIds: [],
  rowLevelPermissionPredicateIds: [],
  rowLevelPermissionPredicateGroupIds: [],
  roleTargetUniversalIdentifiers: [],
  objectPermissionUniversalIdentifiers: [],
  rolePermissionFlagUniversalIdentifiers: [],
  fieldPermissionUniversalIdentifiers: [],
  rowLevelPermissionRuleUniversalIdentifiers: [],
  agentChatChannelRoleUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  ...flatRole,
});

const buildFlatRoleMaps = (flatRoles: FlatRole[]): FlatRoleMaps => ({
  byUniversalIdentifier: Object.fromEntries(
    flatRoles.map((flatRole) => [flatRole.universalIdentifier, flatRole]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatRoles.map((flatRole) => [flatRole.id, flatRole.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const flatRoleMaps = buildFlatRoleMaps([
  buildFlatRole({ id: 'member-role', isSystemSideEffect: false }),
  buildFlatRole({ id: 'personal-role', isSystemSideEffect: true }),
]);

describe('findUserWorkspaceAssignedRoleId', () => {
  it('returns the role that is not a system side effect', () => {
    expect(
      findUserWorkspaceAssignedRoleId({
        userWorkspaceId: 'user-workspace',
        userWorkspaceRoleMap: {
          'user-workspace': ['personal-role', 'member-role'],
        },
        flatRoleMaps,
      }),
    ).toBe('member-role');
  });

  it('returns undefined when the member only holds system side effect roles', () => {
    expect(
      findUserWorkspaceAssignedRoleId({
        userWorkspaceId: 'user-workspace',
        userWorkspaceRoleMap: { 'user-workspace': ['personal-role'] },
        flatRoleMaps,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for an unknown member', () => {
    expect(
      findUserWorkspaceAssignedRoleId({
        userWorkspaceId: 'unknown-user-workspace',
        userWorkspaceRoleMap: {},
        flatRoleMaps,
      }),
    ).toBeUndefined();
  });
});
