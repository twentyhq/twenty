import { context } from 'esbuild';

import { buildFrontComponentWithLimitsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-with-limits-or-throw.util';

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
      watch: jest.fn(),
      serve: jest.fn(),
    });
    cancel.mockResolvedValue(undefined);
    dispose.mockResolvedValue(undefined);
    rebuild.mockResolvedValue(output);
  });

  afterEach(() => jest.useRealTimers());

  it('returns a completed build and releases its compiler context', async () => {
    await expect(buildFrontComponentWithLimitsOrThrow({})).resolves.toBe(
      output,
    );
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
    const result = expect(
      buildFrontComponentWithLimitsOrThrow({}),
    ).rejects.toMatchObject({
      message: 'Component build exceeded the 10 second time limit.',
      code: 'BUILD_FAILED',
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Component build exceeded the 10 second time limit.',
      },
    });

    await jest.advanceTimersByTimeAsync(10000);
    await result;
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
    await expect(buildFrontComponentWithLimitsOrThrow({})).resolves.toBe(
      output,
    );
  });

  it('rejects late success after cancellation', async () => {
    rebuild.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          cancel.mockImplementationOnce(async () => resolve(output));
        }),
    );
    const result = expect(
      buildFrontComponentWithLimitsOrThrow({}),
    ).rejects.toThrow('10 second time limit');

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

    await expect(
      buildFrontComponentWithLimitsOrThrow({}),
    ).rejects.toMatchObject({
      message: 'Component build exceeds the 5 MB output limit.',
      code: 'INVALID_INPUT',
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Component build exceeds the 5 MB output limit.',
      },
    });
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('preserves compiler diagnostics and releases a failed build', async () => {
    rebuild.mockRejectedValueOnce(new Error('Unsupported import'));
    await expect(
      buildFrontComponentWithLimitsOrThrow({}),
    ).rejects.toMatchObject({
      message: 'Unsupported import',
      code: 'BUILD_FAILED',
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Failed to build front component.',
      },
    });
    expect(dispose).toHaveBeenCalledTimes(1);
    await expect(buildFrontComponentWithLimitsOrThrow({})).resolves.toBe(
      output,
    );
  });

  it('wraps context creation failures without disposing a missing context', async () => {
    jest
      .mocked(context)
      .mockRejectedValueOnce(new Error('Invalid build options'));

    await expect(
      buildFrontComponentWithLimitsOrThrow({}),
    ).rejects.toMatchObject({
      message: 'Invalid build options',
      code: 'BUILD_FAILED',
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Failed to build front component.',
      },
    });
    expect(dispose).not.toHaveBeenCalled();
    await expect(buildFrontComponentWithLimitsOrThrow({})).resolves.toBe(
      output,
    );
  });
});
