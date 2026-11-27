import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';

const ROLE_ID = 'role-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const FLAT_ENTITY_DEFAULTS = {
  applicationId: 'application-id',
  applicationUniversalIdentifier: '20202020-64aa-4b6f-b003-9c74b97cee20',
  workspaceId: 'workspace-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const FLAT_ROLE: FlatRole = {
  ...FLAT_ENTITY_DEFAULTS,
  id: ROLE_ID,
  universalIdentifier: 'role-universal-identifier',
  label: 'Role',
  description: null,
  icon: null,
  isEditable: true,
  isSystemSideEffect: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
  canBeAssignedToApplications: true,
  roleTargetIds: [],
  objectPermissionIds: [],
  rolePermissionFlagIds: [],
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
};

const EXISTING_FLAT_ROLE_TARGET: FlatRoleTarget = {
  ...FLAT_ENTITY_DEFAULTS,
  id: 'existing-role-target-id',
  universalIdentifier: 'existing-role-target-universal-identifier',
  roleId: 'previous-role-id',
  roleUniversalIdentifier: 'previous-role-universal-identifier',
  userWorkspaceId: USER_WORKSPACE_ID,
  isSystemSideEffect: false,
  agentId: null,
  agentUniversalIdentifier: null,
  apiKeyId: null,
  webhookId: null,
  webhookUniversalIdentifier: null,
  targetApplicationId: null,
  targetApplicationUniversalIdentifier: null,
};

const computeFlatRoleTarget = (flatRole: FlatRole) =>
  fromCreateRoleTargetInputToFlatRoleTargetToCreate({
    createRoleTargetInput: {
      roleId: ROLE_ID,
      targetId: USER_WORKSPACE_ID,
      targetMetadataForeignKey: 'userWorkspaceId',
    },
    workspaceId: FLAT_ENTITY_DEFAULTS.workspaceId,
    flatApplication: {
      id: FLAT_ENTITY_DEFAULTS.applicationId,
      universalIdentifier: FLAT_ENTITY_DEFAULTS.applicationUniversalIdentifier,
    } as FlatApplication,
    flatRoleMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatRole,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    flatRoleTargetMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: EXISTING_FLAT_ROLE_TARGET,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    flatAgentMaps: createEmptyFlatEntityMaps(),
    flatWebhookMaps: createEmptyFlatEntityMaps(),
  });

describe('fromCreateRoleTargetInputToFlatRoleTargetToCreate', () => {
  it('should replace the current role of the target when the role is a regular one', () => {
    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      computeFlatRoleTarget(FLAT_ROLE);

    expect(flatRoleTargetToCreate).toMatchObject({
      roleId: ROLE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      isSystemSideEffect: false,
    });
    expect(flatRoleTargetsToDelete).toEqual([EXISTING_FLAT_ROLE_TARGET]);
  });

  it('should treat a role cached before the isSystemSideEffect column existed as a regular one', () => {
    const { isSystemSideEffect: _isSystemSideEffect, ...flatRoleCachedBefore } =
      FLAT_ROLE;

    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      computeFlatRoleTarget(flatRoleCachedBefore as FlatRole);

    expect(flatRoleTargetToCreate.isSystemSideEffect).toBe(false);
    expect(flatRoleTargetsToDelete).toEqual([EXISTING_FLAT_ROLE_TARGET]);
  });

  it('should add a system side effect role next to the current role of the target', () => {
    const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
      computeFlatRoleTarget({ ...FLAT_ROLE, isSystemSideEffect: true });

    expect(flatRoleTargetToCreate.isSystemSideEffect).toBe(true);
    expect(flatRoleTargetsToDelete).toEqual([]);
  });
});
