import { createTurnAuthorizer } from 'src/engine/metadata-modules/ai/ai-chat/utils/create-turn-authorizer.util';

describe('createTurnAuthorizer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reuses the authorization the turn started with until it is too old', async () => {
    const authorize = jest.fn().mockResolvedValue('rechecked');
    const getAuthorization = createTurnAuthorizer({
      authorize,
      authorization: 'initial',
      maxAgeMs: 2_000,
    });

    await expect(getAuthorization()).resolves.toBe('initial');
    jest.advanceTimersByTime(1_999);
    await expect(getAuthorization()).resolves.toBe('initial');
    expect(authorize).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await expect(getAuthorization()).resolves.toBe('rechecked');
    expect(authorize).toHaveBeenCalledTimes(1);
  });

  it('shares one check between concurrent callers', async () => {
    const authorize = jest.fn().mockResolvedValue('rechecked');
    const getAuthorization = createTurnAuthorizer({
      authorize,
      authorization: 'initial',
      maxAgeMs: 2_000,
    });

    jest.advanceTimersByTime(2_000);
    await Promise.all([getAuthorization(), getAuthorization()]);

    expect(authorize).toHaveBeenCalledTimes(1);
  });

  it('refuses every caller in the window once access is revoked', async () => {
    const authorize = jest
      .fn()
      .mockRejectedValueOnce(new Error('revoked'))
      .mockResolvedValue('restored');
    const getAuthorization = createTurnAuthorizer({
      authorize,
      authorization: 'initial',
      maxAgeMs: 2_000,
    });

    jest.advanceTimersByTime(2_000);
    await expect(getAuthorization()).rejects.toThrow('revoked');
    await expect(getAuthorization()).rejects.toThrow('revoked');
    expect(authorize).toHaveBeenCalledTimes(1);
  });
});
