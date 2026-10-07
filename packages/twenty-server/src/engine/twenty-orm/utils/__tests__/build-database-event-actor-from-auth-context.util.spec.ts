import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { buildDatabaseEventActorFromAuthContext } from 'src/engine/twenty-orm/utils/build-database-event-actor-from-auth-context.util';

describe('buildDatabaseEventActorFromAuthContext', () => {
  it('names the user even when an application carries the request', () => {
    expect(
      buildDatabaseEventActorFromAuthContext({
        user: { id: 'user-id' } as FlatAuthContextUser,
        application: { id: 'application-id' } as FlatApplication,
      }),
    ).toEqual({ type: 'user' });
  });

  it('names the api key', () => {
    expect(
      buildDatabaseEventActorFromAuthContext({
        apiKey: { id: 'api-key-id' } as FlatApiKey,
      }),
    ).toEqual({ type: 'apiKey' });
  });

  it('names the application when no user is behind it', () => {
    expect(
      buildDatabaseEventActorFromAuthContext({
        application: { id: 'application-id' } as FlatApplication,
      }),
    ).toEqual({ type: 'application' });
  });

  it('falls back to system for background writes', () => {
    expect(buildDatabaseEventActorFromAuthContext(undefined)).toEqual({
      type: 'system',
    });
    expect(buildDatabaseEventActorFromAuthContext({})).toEqual({
      type: 'system',
    });
  });
});
