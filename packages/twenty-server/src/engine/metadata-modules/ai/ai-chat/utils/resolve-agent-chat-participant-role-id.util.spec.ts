import { resolveAgentChatParticipantRoleId } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-participant-role-id.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

const USER_WORKSPACE_ID = 'user-workspace-id';
const ROLE_ID = 'role-id';
const ROLE_UNIVERSAL_IDENTIFIER = 'role-universal-identifier';

const buildFlatRoleMaps = (
  overrides: Partial<FlatRole>,
): FlatEntityMaps<FlatRole> => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: {
    [ROLE_UNIVERSAL_IDENTIFIER]: {
      id: ROLE_ID,
      universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      rolePermissionFlagIds: [],
      ...overrides,
    } as FlatRole,
  },
  universalIdentifierById: { [ROLE_ID]: ROLE_UNIVERSAL_IDENTIFIER },
});

const sharedArguments = {
  userWorkspaceId: USER_WORKSPACE_ID,
  userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: ROLE_ID },
  flatRolePermissionFlagMaps: createEmptyFlatEntityMaps(),
};

describe('resolveAgentChatParticipantRoleId', () => {
  it('resolves a role granted every tool', () => {
    expect(
      resolveAgentChatParticipantRoleId({
        ...sharedArguments,
        flatRoleMaps: buildFlatRoleMaps({ canAccessAllTools: true }),
      }),
    ).toBe(ROLE_ID);
  });

  it('rejects a role without the AI permission', () => {
    expect(
      resolveAgentChatParticipantRoleId({
        ...sharedArguments,
        flatRoleMaps: buildFlatRoleMaps({ canUpdateAllSettings: true }),
      }),
    ).toBeUndefined();
  });

  it('rejects a membership without a role', () => {
    expect(
      resolveAgentChatParticipantRoleId({
        ...sharedArguments,
        userWorkspaceRoleMap: {},
        flatRoleMaps: buildFlatRoleMaps({ canAccessAllTools: true }),
      }),
    ).toBeUndefined();
  });

  it('rejects a role missing from the cache', () => {
    expect(
      resolveAgentChatParticipantRoleId({
        ...sharedArguments,
        flatRoleMaps: createEmptyFlatEntityMaps(),
      }),
    ).toBeUndefined();
  });
});
