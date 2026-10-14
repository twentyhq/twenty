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
      { workspaceId: WORKSPACE_ID, visibility: 'workspace' },
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
    [
      'explicit null fields',
      { ownedByCaller: null, appConnectionVisibility: null },
    ],
    ['ownedByCaller false', { ownedByCaller: false }],
  ])('matches like no filter with %s', (_, filter) => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter,
      }),
    ).toEqual([
      { workspaceId: WORKSPACE_ID, visibility: 'workspace' },
      { workspaceId: WORKSPACE_ID, userWorkspaceId: USER_WORKSPACE_ID },
    ]);
  });

  it('keeps every non-app account and only the app connections with the requested visibility', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { appConnectionVisibility: 'workspace' },
      }),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        visibility: 'workspace',
        provider: Not(ConnectedAccountProvider.APP),
      },
      {
        workspaceId: WORKSPACE_ID,
        visibility: 'workspace',
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
        visibility: 'workspace',
      },
    ]);
  });

  it('does not widen the workspace-shared clause to other members private app connections', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { appConnectionVisibility: 'user' },
      }),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        visibility: 'workspace',
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
        visibility: 'user',
      },
    ]);
  });

  it('matches the caller own accounts minus workspace-shared app connections for App preferences', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { ownedByCaller: true, appConnectionVisibility: 'user' },
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
        visibility: 'user',
      },
    ]);
  });

  it('matches the caller own accounts with only their workspace-shared app connections', () => {
    expect(
      buildMyConnectedAccountsWhere({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        filter: { ownedByCaller: true, appConnectionVisibility: 'workspace' },
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
        visibility: 'workspace',
      },
    ]);
  });
});
