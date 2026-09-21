import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { canActorActAsConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-act-as-connected-account.util';

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

const buildUserAuthContext = () =>
  ({
    type: 'user',
    userWorkspaceId: USER_WORKSPACE_ID,
  }) as WorkspaceAuthContext;

const buildApplicationAuthContext = (
  applicationId: string,
  universalIdentifier = 'third-party-application',
) =>
  ({
    type: 'application',
    application: { id: applicationId, universalIdentifier },
  }) as WorkspaceAuthContext;

describe('canActorActAsConnectedAccount', () => {
  it('lets a user act as their own account', () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildUserAuthContext(),
        connectedAccount: buildConnectedAccount({
          userWorkspaceId: USER_WORKSPACE_ID,
        }),
      }),
    ).toBe(true);
  });

  it('lets a user act as an account shared with the workspace', () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildUserAuthContext(),
        connectedAccount: buildConnectedAccount({ visibility: 'workspace' }),
      }),
    ).toBe(true);
  });

  it("refuses a user acting as a teammate's private account", () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildUserAuthContext(),
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(false);
  });

  it('lets an application act as an account it owns', () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildApplicationAuthContext(APPLICATION_ID),
        connectedAccount: buildConnectedAccount({
          applicationId: APPLICATION_ID,
        }),
      }),
    ).toBe(true);
  });

  it("lets Twenty's own application act as a member's private account", () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildApplicationAuthContext(
          APPLICATION_ID,
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(true);
  });

  it("refuses a third-party application acting as a member's private account", () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildApplicationAuthContext(APPLICATION_ID),
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(false);
  });

  it('lets a third-party application act as an account shared with the workspace', () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildApplicationAuthContext(APPLICATION_ID),
        connectedAccount: buildConnectedAccount({ visibility: 'workspace' }),
      }),
    ).toBe(true);
  });

  it("refuses an application acting as another application's account", () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: buildApplicationAuthContext(APPLICATION_ID),
        connectedAccount: buildConnectedAccount({
          visibility: 'workspace',
          applicationId: OTHER_APPLICATION_ID,
        }),
      }),
    ).toBe(false);
  });

  it("lets an api key or a system job act as a member's private account", () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: { type: 'apiKey' } as WorkspaceAuthContext,
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(true);
    expect(
      canActorActAsConnectedAccount({
        authContext: { type: 'system' } as WorkspaceAuthContext,
        connectedAccount: buildConnectedAccount({}),
      }),
    ).toBe(true);
  });

  it('refuses a user pending activation', () => {
    expect(
      canActorActAsConnectedAccount({
        authContext: { type: 'pendingActivationUser' } as WorkspaceAuthContext,
        connectedAccount: buildConnectedAccount({ visibility: 'workspace' }),
      }),
    ).toBe(false);
  });
});
