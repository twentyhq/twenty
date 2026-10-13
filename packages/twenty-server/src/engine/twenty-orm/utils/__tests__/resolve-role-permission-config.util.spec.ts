import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const API_KEY_ID = 'api-key-1';
const API_KEY_ROLE_ID = 'api-key-role-1';
const AGENT_ROLE_ID = 'agent-role-1';
const AGENT_ID = 'agent-1';
const AGENT_WITHOUT_ROLE_ID = 'agent-without-role';

const buildUserContext = ({
  userWorkspaceId = USER_WORKSPACE_ID,
  application,
}: {
  userWorkspaceId?: string;
  application?: { defaultRoleId: string | null };
} = {}): WorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: { id: 'workspace-1' },
    userWorkspaceId,
    user: { id: 'user-1' },
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' },
    ...(application ? { application } : {}),
  }) as unknown as WorkspaceAuthContext;

const buildApiKeyContext = (apiKeyId: string): WorkspaceAuthContext =>
  ({
    type: 'apiKey',
    workspace: { id: 'workspace-1' },
    apiKey: { id: apiKeyId },
  }) as unknown as WorkspaceAuthContext;

const buildApplicationContext = (
  defaultRoleId: string | null,
): WorkspaceAuthContext =>
  ({
    type: 'application',
    workspace: { id: 'workspace-1' },
    application: { defaultRoleId },
  }) as unknown as WorkspaceAuthContext;

const withAgent = (
  authContext: WorkspaceAuthContext,
  agentId: string,
): WorkspaceAuthContext =>
  ({ ...authContext, agentId }) as WorkspaceAuthContext;

const resolve = (authContext: WorkspaceAuthContext) =>
  resolveRolePermissionConfig({
    authContext,
    userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: USER_ROLE_ID },
    apiKeyRoleMap: { [API_KEY_ID]: API_KEY_ROLE_ID },
    flatRoleTargetByAgentIdMaps: {
      [AGENT_ID]: { roleId: AGENT_ROLE_ID },
    } as unknown as FlatRoleTargetByAgentIdMaps,
  });

describe('resolveRolePermissionConfig', () => {
  it('bypasses permission checks for a system request', () => {
    expect(
      resolve({
        type: 'system',
        workspace: { id: 'workspace-1' },
      } as unknown as WorkspaceAuthContext),
    ).toEqual({ shouldBypassPermissionChecks: true });
  });

  it('restricts a user request to the user role', () => {
    expect(resolve(buildUserContext())).toEqual({
      intersectionOf: { userWorkspaceRoleId: USER_ROLE_ID },
    });
  });

  it('bounds the user role by the application acting for the user', () => {
    expect(
      resolve(
        buildUserContext({
          application: { defaultRoleId: APPLICATION_ROLE_ID },
        }),
      ),
    ).toEqual({
      intersectionOf: {
        userWorkspaceRoleId: USER_ROLE_ID,
        applicationRoleId: APPLICATION_ROLE_ID,
      },
    });
  });

  it('adds no application restriction when the application has no role', () => {
    expect(
      resolve(buildUserContext({ application: { defaultRoleId: null } })),
    ).toEqual({ intersectionOf: { userWorkspaceRoleId: USER_ROLE_ID } });
  });

  it('allows nothing for a user without a role, even with an application', () => {
    expect(
      resolve(
        buildUserContext({
          userWorkspaceId: 'unknown-user-workspace',
          application: { defaultRoleId: APPLICATION_ROLE_ID },
        }),
      ),
    ).toBeNull();
  });

  it('allows nothing for a user without a role, with an application without a role', () => {
    expect(
      resolve(
        buildUserContext({
          userWorkspaceId: 'unknown-user-workspace',
          application: { defaultRoleId: null },
        }),
      ),
    ).toBeNull();
  });

  it('allows nothing for a user without a role acting alone', () => {
    expect(
      resolve(buildUserContext({ userWorkspaceId: 'unknown-user-workspace' })),
    ).toBeNull();
  });

  it('restricts an api key request to the api key role', () => {
    expect(resolve(buildApiKeyContext(API_KEY_ID))).toEqual({
      intersectionOf: { apiKeyRoleId: API_KEY_ROLE_ID },
    });
  });

  it('allows nothing for an api key without a role', () => {
    expect(resolve(buildApiKeyContext('unknown-api-key'))).toBeNull();
  });

  it('restricts an application request to the application role', () => {
    expect(resolve(buildApplicationContext(APPLICATION_ROLE_ID))).toEqual({
      intersectionOf: { applicationRoleId: APPLICATION_ROLE_ID },
    });
  });

  it('allows nothing for an application without a role', () => {
    expect(resolve(buildApplicationContext(null))).toBeNull();
  });

  it('narrows a user application token to the role of the agent it carries', () => {
    expect(
      resolve(
        withAgent(
          buildUserContext({
            application: { defaultRoleId: APPLICATION_ROLE_ID },
          }),
          AGENT_ID,
        ),
      ),
    ).toEqual({
      intersectionOf: {
        userWorkspaceRoleId: USER_ROLE_ID,
        applicationRoleId: APPLICATION_ROLE_ID,
        agentRoleId: AGENT_ROLE_ID,
      },
    });
  });

  it('narrows an application token to the role of the agent it carries', () => {
    expect(
      resolve(
        withAgent(buildApplicationContext(APPLICATION_ROLE_ID), AGENT_ID),
      ),
    ).toEqual({
      intersectionOf: {
        applicationRoleId: APPLICATION_ROLE_ID,
        agentRoleId: AGENT_ROLE_ID,
      },
    });
  });

  it('allows nothing when the agent the token carries has no role', () => {
    expect(
      resolve(withAgent(buildUserContext(), AGENT_WITHOUT_ROLE_ID)),
    ).toBeNull();
  });

  it('allows nothing for an application without a role, even with an agent', () => {
    expect(
      resolve(withAgent(buildApplicationContext(null), AGENT_ID)),
    ).toBeNull();
  });
});
