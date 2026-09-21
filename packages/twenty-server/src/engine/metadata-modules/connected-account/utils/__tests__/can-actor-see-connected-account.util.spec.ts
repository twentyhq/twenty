import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { canActorSeeConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-see-connected-account.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const APPLICATION_ID = '20202020-4444-4444-8444-444444444444';
const OTHER_APPLICATION_ID = '20202020-5555-4555-8555-555555555555';

const buildConnectedAccount = ({
  visibility = 'user',
  userWorkspaceId = OTHER_USER_WORKSPACE_ID,
  applicationId = null,
}: {
  visibility?: 'user' | 'workspace';
  userWorkspaceId?: string;
  applicationId?: string | null;
}) => ({ visibility, userWorkspaceId, applicationId }) as const;

const applicationAuthContext = {
  type: 'application',
  application: { id: APPLICATION_ID },
} as WorkspaceAuthContext;

describe('canActorSeeConnectedAccount', () => {
  it("shows a user their own account but not a teammate's private one", () => {
    const authContext = {
      type: 'user',
      userWorkspaceId: USER_WORKSPACE_ID,
    } as WorkspaceAuthContext;

    expect(
      canActorSeeConnectedAccount({
        authContext,
        connectedAccount: buildConnectedAccount({
          userWorkspaceId: USER_WORKSPACE_ID,
        }),
      }),
    ).toBe(true);
    expect(
      canActorSeeConnectedAccount({
        authContext,
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(false);
  });

  it('shows an application its own connection', () => {
    expect(
      canActorSeeConnectedAccount({
        authContext: applicationAuthContext,
        connectedAccount: buildConnectedAccount({
          applicationId: APPLICATION_ID,
        }),
      }),
    ).toBe(true);
  });

  it("hides another application's connection even when shared", () => {
    expect(
      canActorSeeConnectedAccount({
        authContext: applicationAuthContext,
        connectedAccount: buildConnectedAccount({
          visibility: 'workspace',
          applicationId: OTHER_APPLICATION_ID,
        }),
      }),
    ).toBe(false);
  });

  it('shows an application only the member accounts shared with the workspace', () => {
    expect(
      canActorSeeConnectedAccount({
        authContext: applicationAuthContext,
        connectedAccount: buildConnectedAccount({ visibility: 'workspace' }),
      }),
    ).toBe(true);
    expect(
      canActorSeeConnectedAccount({
        authContext: applicationAuthContext,
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(false);
  });

  it('shows an api key only accounts shared with the workspace', () => {
    const authContext = { type: 'apiKey' } as WorkspaceAuthContext;

    expect(
      canActorSeeConnectedAccount({
        authContext,
        connectedAccount: buildConnectedAccount({ visibility: 'workspace' }),
      }),
    ).toBe(true);
    expect(
      canActorSeeConnectedAccount({
        authContext,
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(false);
  });

  it('shows system jobs every account and hides everything from a pending user', () => {
    expect(
      canActorSeeConnectedAccount({
        authContext: { type: 'system' } as WorkspaceAuthContext,
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(true);
    expect(
      canActorSeeConnectedAccount({
        authContext: { type: 'pendingActivationUser' } as WorkspaceAuthContext,
        connectedAccount: buildConnectedAccount({ visibility: 'workspace' }),
      }),
    ).toBe(false);
  });
});
