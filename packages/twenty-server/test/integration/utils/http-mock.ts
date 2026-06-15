import { http, passthrough, type RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

const localhostPassthroughHandlers = [
  http.all('http://127.0.0.1*', () => passthrough()),
  http.all('http://localhost*', () => passthrough()),
];

const server = setupServer(...localhostPassthroughHandlers);

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
    jest.useRealTimers();
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
