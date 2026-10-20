import { context } from 'esbuild';

import { buildFrontComponentWithLimits } from '../build-front-component-with-limits.util';

jest.mock('esbuild', () => ({ context: jest.fn() }));

describe('component build limits', () => {
  const rebuild = jest.fn();
  const cancel = jest.fn();
  const dispose = jest.fn();
  const output = {
    outputFiles: [{ contents: new Uint8Array(10), text: 'component' }],
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    jest.mocked(context).mockResolvedValue({
      rebuild,
      cancel,
      dispose,
    } as unknown as Awaited<ReturnType<typeof context>>);
    cancel.mockResolvedValue(undefined);
    dispose.mockResolvedValue(undefined);
    rebuild.mockResolvedValue(output);
  });

  afterEach(() => jest.useRealTimers());

  it('returns a completed build and releases its compiler context', async () => {
    await expect(buildFrontComponentWithLimits({})).resolves.toBe(output);
    expect(dispose).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(10000);
    expect(cancel).not.toHaveBeenCalled();
  });

  it('cancels an expired build and allows the next build to succeed', async () => {
    rebuild.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          cancel.mockImplementationOnce(async () => {
            reject(new Error('The build was canceled'));
          });
        }),
    );
    const result = expect(buildFrontComponentWithLimits({})).rejects.toThrow(
      '10 second time limit',
    );

    await jest.advanceTimersByTimeAsync(10000);
    await result;
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
    await expect(buildFrontComponentWithLimits({})).resolves.toBe(output);
  });

  it('rejects late success after cancellation', async () => {
    rebuild.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          cancel.mockImplementationOnce(async () => resolve(output));
        }),
    );
    const result = expect(buildFrontComponentWithLimits({})).rejects.toThrow(
      '10 second time limit',
    );

    await jest.advanceTimersByTimeAsync(10000);
    await result;
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('bounds combined output size before it can be cached', async () => {
    rebuild.mockResolvedValueOnce({
      outputFiles: [
        { contents: new Uint8Array(3 * 1024 * 1024) },
        { contents: new Uint8Array(3 * 1024 * 1024) },
      ],
    });

    await expect(buildFrontComponentWithLimits({})).rejects.toThrow(
      '5 MB output limit',
    );
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('preserves compiler diagnostics and releases a failed build', async () => {
    rebuild.mockRejectedValueOnce(new Error('Unsupported import'));
    await expect(buildFrontComponentWithLimits({})).rejects.toThrow(
      'Unsupported import',
    );
    expect(dispose).toHaveBeenCalledTimes(1);
    await expect(buildFrontComponentWithLimits({})).resolves.toBe(output);
  });
});
