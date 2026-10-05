import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';

describe('buildConnectedAccountUsableByCallerWhere', () => {
  it('matches workspace-shared accounts or the caller own accounts', () => {
    expect(
      buildConnectedAccountUsableByCallerWhere({
        baseWhere: { workspaceId: WORKSPACE_ID },
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual([
      { workspaceId: WORKSPACE_ID, visibility: 'workspace' },
      { workspaceId: WORKSPACE_ID, userWorkspaceId: USER_WORKSPACE_ID },
    ]);
  });
});
