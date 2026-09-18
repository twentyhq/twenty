import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
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
      user: { id: 'user-id' },
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
    } as RawAuthContext);

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
      apiKey: { id: 'api-key-id' },
    } as RawAuthContext);

    expect(author.apiKeyId).toBe('api-key-id');
    expect(author.userId).toBeUndefined();
  });

  it('should carry the application', () => {
    const author = buildObjectRecordEventAuthor({
      application: { id: 'application-id' },
    } as RawAuthContext);

    expect(author.applicationId).toBe('application-id');
  });

  it('should carry both the user and the application when an app acts for a user', () => {
    const author = buildObjectRecordEventAuthor({
      user: { id: 'user-id' },
      application: { id: 'application-id' },
    } as RawAuthContext);

    expect(author).toMatchObject({
      userId: 'user-id',
      applicationId: 'application-id',
    });
  });
});
