import { http, passthrough, type RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

import { drainMessageQueues } from 'test/integration/utils/drain-message-queues.util';

// Colon-free matchers: `http://localhost:*` makes path-to-regexp parse `:` as a param (msw#2202).
const localhostPassthroughHandlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.all('http://localhost*', () => passthrough()),
];

const server = setupServer(...localhostPassthroughHandlers);

// msw's RequestHandler references non-exported internals (TS2742), so exported
// signatures take unknown[]; callers always pass RequestHandler values.
export type HttpMock = {
  use: (...handlers: unknown[]) => void;
};

export const setupHttpMock = (...baseHandlers: unknown[]): HttpMock => {
  const applyBaseHandlers = () => {
    if (baseHandlers.length > 0) {
      server.use(...(baseHandlers as RequestHandler[]));
    }
  };

  beforeAll(async () => {
    jest.useRealTimers();
    await drainMessageQueues();
    server.listen({ onUnhandledRequest: 'error' });
    applyBaseHandlers();
  });

  // Reset and re-apply in the same tick: async jobs from the previous test may
  // still be in flight, and a handler-less window would fail their requests.
  afterEach(() => {
    server.resetHandlers();
    applyBaseHandlers();
  });

  afterAll(async () => {
    await drainMessageQueues();
    server.close();
  });

  return {
    use: (...handlers: unknown[]) =>
      server.use(...(handlers as RequestHandler[])),
  };
};
