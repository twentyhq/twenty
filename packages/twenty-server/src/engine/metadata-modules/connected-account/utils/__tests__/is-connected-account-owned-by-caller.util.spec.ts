import { isConnectedAccountOwnedByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-owned-by-caller.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

describe('isConnectedAccountOwnedByCaller', () => {
  it('accepts an account the caller owns', () => {
    expect(
      isConnectedAccountOwnedByCaller({
        connectedAccount: { userWorkspaceId: USER_WORKSPACE_ID },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('rejects a workspace-shared account owned by someone else', () => {
    expect(
      isConnectedAccountOwnedByCaller({
        connectedAccount: { userWorkspaceId: OTHER_USER_WORKSPACE_ID },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });
});
