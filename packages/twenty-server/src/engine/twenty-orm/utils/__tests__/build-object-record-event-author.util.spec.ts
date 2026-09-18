import { buildObjectRecordEventAuthor } from 'src/engine/twenty-orm/utils/build-object-record-event-author.util';

describe('buildObjectRecordEventAuthor', () => {
  it('should leave every field undefined without an auth context', () => {
    expect(buildObjectRecordEventAuthor()).toEqual({
      userId: undefined,
      userWorkspaceId: undefined,
      workspaceMemberId: undefined,
      apiKeyId: undefined,
      applicationId: undefined,
    });
  });

  it('should carry the user', () => {
    const author = buildObjectRecordEventAuthor({
      type: 'user',
      user: { id: 'user-id' },
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
    });

    expect(author).toEqual({
      userId: 'user-id',
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      apiKeyId: undefined,
      applicationId: undefined,
    });
  });

  it('should carry the api key when no user authenticated the request', () => {
    const author = buildObjectRecordEventAuthor({
      type: 'apiKey',
      apiKey: { id: 'api-key-id' },
    });

    expect(author.apiKeyId).toBe('api-key-id');
    expect(author.userId).toBeUndefined();
  });

  it('should carry the application', () => {
    const author = buildObjectRecordEventAuthor({
      type: 'application',
      application: { id: 'application-id' },
    });

    expect(author.applicationId).toBe('application-id');
  });

  it('should carry both the user and the application when an app acts for a user', () => {
    const author = buildObjectRecordEventAuthor({
      type: 'user',
      user: { id: 'user-id' },
      application: { id: 'application-id' },
    });

    expect(author).toMatchObject({
      userId: 'user-id',
      applicationId: 'application-id',
    });
  });

  it('should fall back to the initiating application when an agent runs as a workspace member', () => {
    const author = buildObjectRecordEventAuthor({
      type: 'user',
      user: { id: 'user-id' },
      workspaceMemberId: 'workspace-member-id',
      viaApplication: { id: 'via-application-id' },
    });

    expect(author).toMatchObject({
      userId: 'user-id',
      applicationId: 'via-application-id',
    });
  });

  it('should prefer the direct application over the initiating one', () => {
    const author = buildObjectRecordEventAuthor({
      type: 'user',
      application: { id: 'application-id' },
      viaApplication: { id: 'via-application-id' },
    });

    expect(author.applicationId).toBe('application-id');
  });
});
