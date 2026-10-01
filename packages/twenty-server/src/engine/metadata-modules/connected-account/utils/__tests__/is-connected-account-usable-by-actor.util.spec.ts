import { isConnectedAccountUsableByActor } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-actor.util';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';

describe('isConnectedAccountUsableByActor', () => {
  it('accepts a user own private account', () => {
    expect(
      isConnectedAccountUsableByActor({
        connectedAccount: {
          userWorkspaceId: USER_WORKSPACE_ID,
          visibility: 'user',
        },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(true);
  });

  it('rejects another user private account for a user', () => {
    expect(
      isConnectedAccountUsableByActor({
        connectedAccount: {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          visibility: 'user',
        },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('accepts only workspace-shared accounts when no user is acting', () => {
    expect(
      isConnectedAccountUsableByActor({
        connectedAccount: {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          visibility: 'workspace',
        },
      }),
    ).toBe(true);
    expect(
      isConnectedAccountUsableByActor({
        connectedAccount: {
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
          visibility: 'user',
        },
      }),
    ).toBe(false);
  });
});
