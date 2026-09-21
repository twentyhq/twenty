import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { selectDefaultConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/select-default-connected-account.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

const teammateAccount = {
  id: 'teammate',
  userWorkspaceId: OTHER_USER_WORKSPACE_ID,
};
const ownAccount = { id: 'own', userWorkspaceId: USER_WORKSPACE_ID };

describe('selectDefaultConnectedAccount', () => {
  it("prefers the user's own account over an older shared one", () => {
    expect(
      selectDefaultConnectedAccount({
        authContext: {
          type: 'user',
          userWorkspaceId: USER_WORKSPACE_ID,
        } as WorkspaceAuthContext,
        connectedAccounts: [teammateAccount, ownAccount],
      })?.id,
    ).toBe('own');
  });

  it('falls back to the oldest account when the user owns none', () => {
    expect(
      selectDefaultConnectedAccount({
        authContext: {
          type: 'user',
          userWorkspaceId: USER_WORKSPACE_ID,
        } as WorkspaceAuthContext,
        connectedAccounts: [teammateAccount],
      })?.id,
    ).toBe('teammate');
  });

  it('takes the oldest account for a caller that is not a user', () => {
    expect(
      selectDefaultConnectedAccount({
        authContext: { type: 'apiKey' } as WorkspaceAuthContext,
        connectedAccounts: [teammateAccount, ownAccount],
      })?.id,
    ).toBe('teammate');
  });

  it('prefers the account of the person who started the run', () => {
    expect(
      selectDefaultConnectedAccount({
        authContext: { type: 'application' } as WorkspaceAuthContext,
        initiatorUserWorkspaceId: USER_WORKSPACE_ID,
        connectedAccounts: [teammateAccount, ownAccount],
      })?.id,
    ).toBe('own');
  });

  it('returns nothing when no account is available', () => {
    expect(
      selectDefaultConnectedAccount({
        authContext: { type: 'apiKey' } as WorkspaceAuthContext,
        connectedAccounts: [],
      }),
    ).toBeUndefined();
  });
});
