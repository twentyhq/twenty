import { resolveViewAccessContext } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-access-context.util';

describe('resolveViewAccessContext', () => {
  it('reads the user principal', () => {
    expect(
      resolveViewAccessContext({
        workspace: { id: 'workspace-id' },
        userWorkspaceId: 'user-workspace-id',
      }),
    ).toEqual({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      apiKeyId: undefined,
      applicationId: undefined,
    });
  });

  it('reads the api key principal', () => {
    expect(
      resolveViewAccessContext({
        workspace: { id: 'workspace-id' },
        apiKey: { id: 'api-key-id' },
      }),
    ).toEqual({
      workspaceId: 'workspace-id',
      userWorkspaceId: undefined,
      apiKeyId: 'api-key-id',
      applicationId: undefined,
    });
  });

  it('reads the application principal', () => {
    expect(
      resolveViewAccessContext({
        workspace: { id: 'workspace-id' },
        application: { id: 'application-id' },
      }),
    ).toEqual({
      workspaceId: 'workspace-id',
      userWorkspaceId: undefined,
      apiKeyId: undefined,
      applicationId: 'application-id',
    });
  });

  it('keeps both principals when an application token impersonates a user', () => {
    expect(
      resolveViewAccessContext({
        workspace: { id: 'workspace-id' },
        userWorkspaceId: 'user-workspace-id',
        application: { id: 'application-id' },
      }),
    ).toEqual({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      apiKeyId: undefined,
      applicationId: 'application-id',
    });
  });
});
