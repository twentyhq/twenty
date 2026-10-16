import { Not } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { buildMyConnectedAccountsWhere } from 'src/engine/metadata-modules/connected-account/utils/build-my-connected-accounts-where.util';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';

describe('buildMyConnectedAccountsWhere', () => {
  it('matches workspace-shared accounts or the caller own accounts without a filter', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual([
      { workspaceId: WORKSPACE_ID, scope: 'WORKSPACE' },
      { workspaceId: WORKSPACE_ID, userWorkspaceId: USER_WORKSPACE_ID },
    ]);
  });

  it('matches only the caller own accounts when ownedByCaller is true', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { ownedByCaller: true },
      }),
    ).toEqual([
      { workspaceId: WORKSPACE_ID, userWorkspaceId: USER_WORKSPACE_ID },
    ]);
  });

  it.each([
    ['a null filter', null],
    ['explicit null fields', { ownedByCaller: null, appConnectionScope: null }],
    ['ownedByCaller false', { ownedByCaller: false }],
  ])('matches like no filter with %s', (_, filter) => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter,
      }),
    ).toEqual([
      { workspaceId: WORKSPACE_ID, scope: 'WORKSPACE' },
      { workspaceId: WORKSPACE_ID, userWorkspaceId: USER_WORKSPACE_ID },
    ]);
  });

  it('keeps every non-app account and only the app connections with the requested scope', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { appConnectionScope: 'WORKSPACE' },
      }),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        scope: 'WORKSPACE',
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        scope: 'WORKSPACE',
        provider: ConnectedAccountProvider.APP,
      },
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: ConnectedAccountProvider.APP,
        scope: 'WORKSPACE',
      },
    ]);
  });

  it('does not widen the workspace-shared clause to other members private app connections', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { appConnectionScope: 'USER' },
      }),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        scope: 'WORKSPACE',
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: ConnectedAccountProvider.APP,
        scope: 'USER',
      },
    ]);
  });

  it('matches the caller own accounts minus workspace-shared app connections for App preferences', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { ownedByCaller: true, appConnectionScope: 'USER' },
      }),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: ConnectedAccountProvider.APP,
        scope: 'USER',
      },
    ]);
  });

  it('matches the caller own accounts with only their workspace-shared app connections', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { ownedByCaller: true, appConnectionScope: 'WORKSPACE' },
      }),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        provider: ConnectedAccountProvider.APP,
        scope: 'WORKSPACE',
      },
    ]);
  });
});
