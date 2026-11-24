import { isDefined } from 'twenty-shared/utils';

type InFlightRequest<TResult> = {
  promise: Promise<TResult>;
  abortController: AbortController;
  waiterCount: number;
};

// Identical requests share one generation, which is only cancelled once every waiter has left
export const createAiSearchAnswerInFlightRequests = <TResult>() => {
  const inFlightRequestByKey = new Map<string, InFlightRequest<TResult>>();

  const forget = (key: string, inFlightRequest: InFlightRequest<TResult>) => {
    if (inFlightRequestByKey.get(key) === inFlightRequest) {
      inFlightRequestByKey.delete(key);
    }
  };

  const start = (
    key: string,
    execute: (signal: AbortSignal) => Promise<TResult>,
  ): InFlightRequest<TResult> => {
    const abortController = new AbortController();
    const inFlightRequest: InFlightRequest<TResult> = {
      promise: execute(abortController.signal),
      abortController,
      waiterCount: 0,
    };

    inFlightRequestByKey.set(key, inFlightRequest);

    // every waiter receives the rejection; this only stops an abandoned request from going unhandled
    inFlightRequest.promise.then(
      () => forget(key, inFlightRequest),
      () => forget(key, inFlightRequest),
    );

    return inFlightRequest;
  };

  const run = ({
    key,
    waiterSignal,
    execute,
  }: {
    key: string;
    waiterSignal: AbortSignal;
    execute: (signal: AbortSignal) => Promise<TResult>;
  }): { promise: Promise<TResult>; isDeduplicated: boolean } => {
    const existingRequest = inFlightRequestByKey.get(key);
    const inFlightRequest = existingRequest ?? start(key, execute);

    inFlightRequest.waiterCount += 1;

    const leave = () => {
      inFlightRequest.waiterCount -= 1;

      if (inFlightRequest.waiterCount === 0) {
        forget(key, inFlightRequest);
        inFlightRequest.abortController.abort();
      }
    };

    if (waiterSignal.aborted) {
      leave();
    } else {
      waiterSignal.addEventListener('abort', leave, { once: true });

      const stopListening = () =>
        waiterSignal.removeEventListener('abort', leave);

      inFlightRequest.promise.then(stopListening, stopListening);
    }

    return {
      promise: inFlightRequest.promise,
      isDeduplicated: isDefined(existingRequest),
    };
  };

  return { run };
};
