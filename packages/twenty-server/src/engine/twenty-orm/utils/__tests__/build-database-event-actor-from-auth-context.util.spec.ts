import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildDatabaseEventActorFromAuthContext } from 'src/engine/twenty-orm/utils/build-database-event-actor-from-auth-context.util';

describe('buildDatabaseEventActorFromAuthContext', () => {
  it('names the user even when an application carries the request', () => {
    expect(
      buildDatabaseEventActorFromAuthContext({
        user: { id: 'user-id' },
        application: { id: 'application-id' },
      } as unknown as RawAuthContext),
    ).toEqual({ type: 'user' });
  });

  it('names the api key', () => {
    expect(
      buildDatabaseEventActorFromAuthContext({
        apiKey: { id: 'api-key-id' },
      } as unknown as RawAuthContext),
    ).toEqual({ type: 'apiKey' });
  });

  it('names the application when no user is behind it', () => {
    expect(
      buildDatabaseEventActorFromAuthContext({
        application: { id: 'application-id' },
      } as unknown as RawAuthContext),
    ).toEqual({ type: 'application' });
  });

  it('falls back to system for background writes', () => {
    expect(buildDatabaseEventActorFromAuthContext(undefined)).toEqual({
      type: 'system',
    });
    expect(
      buildDatabaseEventActorFromAuthContext({
        workspace: { id: 'workspace-id' },
      } as unknown as RawAuthContext),
    ).toEqual({ type: 'system' });
  });
});
