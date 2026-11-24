import { createAiSearchAnswerInFlightRequests } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/create-ai-search-answer-in-flight-requests.util';

const createDeferred = () => {
  let resolve: (value: string) => void = () => {};
  const promise = new Promise<string>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

describe('createAiSearchAnswerInFlightRequests', () => {
  it('merges identical requests into one generation', async () => {
    const inFlightRequests = createAiSearchAnswerInFlightRequests<string>();
    const deferred = createDeferred();
    const execute = jest.fn(() => deferred.promise);

    const first = inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    });
    const second = inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    });

    deferred.resolve('answer');

    expect(execute).toHaveBeenCalledTimes(1);
    expect(first.isDeduplicated).toBe(false);
    expect(second.isDeduplicated).toBe(true);
    await expect(second.promise).resolves.toBe('answer');
  });

  it('starts a new generation once the previous one settled', async () => {
    const inFlightRequests = createAiSearchAnswerInFlightRequests<string>();
    const execute = jest.fn(async () => 'answer');

    await inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    }).promise;
    await inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    }).promise;

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('keeps generating while another waiter still needs the answer', () => {
    const inFlightRequests = createAiSearchAnswerInFlightRequests<string>();
    const deferred = createDeferred();
    let generationSignal: AbortSignal | undefined;
    const firstWaiter = new AbortController();

    inFlightRequests.run({
      key: 'key',
      waiterSignal: firstWaiter.signal,
      execute: (signal) => {
        generationSignal = signal;

        return deferred.promise;
      },
    });
    inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute: () => deferred.promise,
    });

    firstWaiter.abort();

    expect(generationSignal?.aborted).toBe(false);
  });

  it('cancels the generation when every waiter left and lets the next request start fresh', () => {
    const inFlightRequests = createAiSearchAnswerInFlightRequests<string>();
    const generationSignals: AbortSignal[] = [];
    const execute = jest.fn((signal: AbortSignal) => {
      generationSignals.push(signal);

      return new Promise<string>(() => {});
    });
    const waiter = new AbortController();

    inFlightRequests.run({ key: 'key', waiterSignal: waiter.signal, execute });

    waiter.abort();

    expect(generationSignals[0].aborted).toBe(true);

    const nextRequest = inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    });

    expect(nextRequest.isDeduplicated).toBe(false);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('passes a failure to every waiter', async () => {
    const inFlightRequests = createAiSearchAnswerInFlightRequests<string>();
    const execute = () => Promise.reject(new Error('Provider down'));

    const first = inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    });
    const second = inFlightRequests.run({
      key: 'key',
      waiterSignal: new AbortController().signal,
      execute,
    });

    await expect(first.promise).rejects.toThrow('Provider down');
    await expect(second.promise).rejects.toThrow('Provider down');
  });
});
