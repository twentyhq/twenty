import { http, HttpResponse, passthrough, type RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

const localhostPassthroughHandlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.all('http://localhost*', () => passthrough()),
];

// With onUnhandledRequest: 'error', msw throws an uncaught InternalError inside
// the interceptor and the pending request never settles, which hangs the caller
// forever (jest swallows the exception). Responding 500 instead makes the caller
// fail immediately with an attributable error.
const unmockedRequestCatchAllHandler = http.all('*', ({ request }) => {
  const message = `Unmocked external request in integration test: ${request.method} ${request.url}`;

  console.error(message);

  return HttpResponse.json({ error: { message } }, { status: 500 });
});

const server = setupServer(
  ...localhostPassthroughHandlers,
  unmockedRequestCatchAllHandler,
);

export type MswHandler = RequestHandler;

export type HttpMock = {
  use: (...handlers: MswHandler[]) => void;
};

export const setupHttpMock = (...baseHandlers: MswHandler[]): HttpMock => {
  const applyBaseHandlers = () => {
    if (baseHandlers.length > 0) {
      server.use(...baseHandlers);
    }
  };

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    applyBaseHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
    applyBaseHandlers();
  });

  afterAll(() => {
    server.close();
  });

  return {
    use: (...handlers: MswHandler[]) => server.use(...handlers),
  };
};
