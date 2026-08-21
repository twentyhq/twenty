import { QUERY_READ_TIMEOUT_MESSAGE } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-messages.constants';
import { executeWithTransientRetry } from 'src/modules/workflow/workflow-executor/utils/execute-with-transient-retry.util';

const buildTransientError = () => new Error(QUERY_READ_TIMEOUT_MESSAGE);

describe('executeWithTransientRetry', () => {
  const onFailedAttempt = jest.fn();

  beforeEach(() => {
    onFailedAttempt.mockReset();
    onFailedAttempt.mockResolvedValue(undefined);
  });

  it('executes once when the step succeeds', async () => {
    const execute = jest.fn().mockResolvedValue({ result: { ok: true } });

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 3, onFailedAttempt }),
    ).resolves.toEqual({ result: { ok: true } });

    expect(execute).toHaveBeenCalledTimes(1);
    expect(onFailedAttempt).not.toHaveBeenCalled();
  });

  it('replays the step after a transient failure', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(buildTransientError())
      .mockResolvedValue({ result: { ok: true } });

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 3, onFailedAttempt }),
    ).resolves.toEqual({ result: { ok: true } });

    expect(execute).toHaveBeenCalledTimes(2);
    expect(onFailedAttempt).toHaveBeenCalledTimes(1);
    expect(onFailedAttempt).toHaveBeenCalledWith({ attempt: 1 });
  });

  it('returns a failure the action reported rather than replaying it', async () => {
    const execute = jest.fn().mockResolvedValue({ error: 'Record not found' });

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 3, onFailedAttempt }),
    ).resolves.toEqual({ error: 'Record not found' });

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('surfaces the last failure once the attempts are spent', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(buildTransientError())
      .mockRejectedValueOnce(buildTransientError())
      .mockRejectedValue(new Error('Query read timeout on the last try'));

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 3, onFailedAttempt }),
    ).rejects.toThrow('Query read timeout on the last try');

    expect(execute).toHaveBeenCalledTimes(3);
    expect(onFailedAttempt).toHaveBeenCalledTimes(2);
    expect(onFailedAttempt).toHaveBeenNthCalledWith(1, { attempt: 1 });
    expect(onFailedAttempt).toHaveBeenNthCalledWith(2, { attempt: 2 });
  });

  it('does not replay an ordinary failure', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('Invalid input'));

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 3, onFailedAttempt }),
    ).rejects.toThrow('Invalid input');

    expect(execute).toHaveBeenCalledTimes(1);
    expect(onFailedAttempt).not.toHaveBeenCalled();
  });

  it('executes once when the step opts out of replays', async () => {
    const execute = jest.fn().mockRejectedValue(buildTransientError());

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 1, onFailedAttempt }),
    ).rejects.toThrow(QUERY_READ_TIMEOUT_MESSAGE);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(onFailedAttempt).not.toHaveBeenCalled();
  });

  it('keeps replaying when recording a failed attempt fails', async () => {
    const execute = jest
      .fn()
      .mockRejectedValueOnce(buildTransientError())
      .mockResolvedValue({ result: { ok: true } });

    onFailedAttempt.mockRejectedValue(buildTransientError());

    await expect(
      executeWithTransientRetry({ execute, maxAttempts: 3, onFailedAttempt }),
    ).resolves.toEqual({ result: { ok: true } });

    expect(execute).toHaveBeenCalledTimes(2);
  });
});
