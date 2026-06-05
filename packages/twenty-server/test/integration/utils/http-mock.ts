import { http, passthrough, type RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

// MSW patches the whole process, so it also sees supertest's inbound calls to our own app.
// Let those through. Keep the matchers colon-free: `http://localhost:*` makes path-to-regexp
// parse `:` as a param and crashes beforeAll (msw#2202).
const localhostPassthroughHandlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.all('http://localhost*', () => passthrough()),
];

// One setupServer per test process — multiple instances re-patch node's request modules
// (msw#821). resetHandlers() restores exactly these initial handlers.
const server = setupServer(...localhostPassthroughHandlers);

export type HttpMock = {
  use: (...handlers: unknown[]) => void;
};

// Opt-in: a suite calls this at describe scope to wire MSW's lifecycle (listen/reset/close)
// onto the shared server with `onUnhandledRequest: 'error'`, so any un-mocked outbound call
// fails loudly instead of hitting the real network. `baseHandlers` are re-applied per test as
// the suite's happy-path; per-test variation goes through the returned `use`.
// Handlers are typed loosely because msw's RequestHandler isn't portably nameable in an
// exported signature under our tsconfig; callers always pass RequestHandler values.
export const setupHttpMock = (...baseHandlers: unknown[]): HttpMock => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    if (baseHandlers.length > 0) {
      server.use(...(baseHandlers as RequestHandler[]));
    }
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  return {
    use: (...handlers: unknown[]) =>
      server.use(...(handlers as RequestHandler[])),
  };
};
