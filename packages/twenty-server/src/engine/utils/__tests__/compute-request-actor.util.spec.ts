import { computeRequestActor } from 'src/engine/utils/compute-request-actor.util';

describe('computeRequestActor', () => {
  it('should prefer the api key over the application and the user', () => {
    expect(
      computeRequestActor({
        apiKey: { id: 'api-key-id' },
        application: { id: 'application-id' },
        user: { id: 'user-id' },
      } as Parameters<typeof computeRequestActor>[0]),
    ).toBe('apiKey:api-key-id');
  });

  it('should prefer the application over the user', () => {
    expect(
      computeRequestActor({
        application: { id: 'application-id' },
        user: { id: 'user-id' },
      } as Parameters<typeof computeRequestActor>[0]),
    ).toBe('application:application-id');
  });

  it('should fall back to the user', () => {
    expect(
      computeRequestActor({
        user: { id: 'user-id' },
      } as Parameters<typeof computeRequestActor>[0]),
    ).toBe('user:user-id');
  });

  it('should return undefined when nothing authenticated the request', () => {
    expect(computeRequestActor({})).toBeUndefined();
  });
});
