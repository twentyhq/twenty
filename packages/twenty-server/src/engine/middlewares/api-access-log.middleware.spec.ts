import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type NextFunction, type Request, type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { computeRequestTraceContext } from 'src/engine/utils/compute-request-trace-context.util';
import { ApiAccessLogMiddleware } from 'src/engine/middlewares/api-access-log.middleware';

jest.mock('src/engine/utils/compute-request-trace-context.util', () => ({
  computeRequestTraceContext: jest.fn(() => undefined),
}));

const computeRequestTraceContextMock =
  computeRequestTraceContext as jest.MockedFunction<
    typeof computeRequestTraceContext
  >;

describe('ApiAccessLogMiddleware', () => {
  let middleware: ApiAccessLogMiddleware;
  let logSpy: jest.SpyInstance;
  let next: NextFunction;
  let isEnabled: boolean;

  const buildRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      method: 'POST',
      originalUrl: '/rest/people/ba91bdfb?depth=1',
      headers: {},
      ...overrides,
    }) as unknown as Request;

  const buildResponse = () => {
    const listenersByEvent = new Map<string, (() => void)[]>();

    const response = {
      statusCode: 200,
      once: jest.fn((event: string, listener: () => void) => {
        listenersByEvent.set(event, [
          ...(listenersByEvent.get(event) ?? []),
          listener,
        ]);
      }),
    } as unknown as Response;

    const emit = (event: string) =>
      (listenersByEvent.get(event) ?? []).forEach((listener) => listener());

    return {
      response,
      finish: () => emit('finish'),
      close: () => emit('close'),
    };
  };

  const runAndCaptureLine = (request: Request): string => {
    const { response, finish } = buildResponse();

    middleware.use(request, response, next);
    finish();

    return logSpy.mock.calls.at(-1)?.[0] as string;
  };

  beforeEach(async () => {
    isEnabled = true;
    computeRequestTraceContextMock.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiAccessLogMiddleware,
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn(() => isEnabled) },
        },
      ],
    }).compile();

    middleware = module.get<ApiAccessLogMiddleware>(ApiAccessLogMiddleware);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not log when disabled', () => {
    isEnabled = false;

    const { response, finish } = buildResponse();

    middleware.use(buildRequest(), response, next);
    finish();

    expect(response.once).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should log the path without its query string', () => {
    const line = runAndCaptureLine(buildRequest());

    expect(line).toContain('method=POST');
    expect(line).toContain('url_path=/rest/people/ba91bdfb');
    expect(line).not.toContain('depth=1');
    expect(line).toContain('status=200');
  });

  it('should log the user as actor', () => {
    const line = runAndCaptureLine(
      buildRequest({
        user: { id: 'user-id' },
        workspaceId: 'workspace-id',
        ip: '85.222.104.50',
      } as unknown as Partial<Request>),
    );

    expect(line).toContain('actor=user');
    expect(line).toContain('actor_id=user-id');
    expect(line).toContain('workspace_id=workspace-id');
    expect(line).toContain('client_ip=85.222.104.50');
  });

  it('should prefer the api key over the user as actor', () => {
    const line = runAndCaptureLine(
      buildRequest({
        apiKey: { id: 'api-key-id' },
        user: { id: 'user-id' },
      } as unknown as Partial<Request>),
    );

    expect(line).toContain('actor=apiKey');
    expect(line).toContain('actor_id=api-key-id');
  });

  it('should log anonymous when nothing authenticated the request', () => {
    const line = runAndCaptureLine(buildRequest());

    expect(line).toContain('actor=anonymous');
    expect(line).not.toContain('actor_id=');
  });

  it('should log the resolvers captured by the graphql pipelines', () => {
    const line = runAndCaptureLine(
      buildRequest({
        originalUrl: '/graphql',
        executedRootResolvers: ['createOneCompany', 'deleteManyPeople'],
      }),
    );

    expect(line).toContain('url_path=/graphql');
    expect(line).toContain('resolvers=createOneCompany,deleteManyPeople');
  });

  it('should omit resolvers for a non graphql request', () => {
    expect(runAndCaptureLine(buildRequest())).not.toContain('resolvers=');
  });

  it('should truncate a long resolver list with a remainder count', () => {
    const line = runAndCaptureLine(
      buildRequest({
        originalUrl: '/graphql',
        executedRootResolvers: Array.from(
          { length: 40 },
          (_unused, index) => `findManyVeryLongObjectName${index}`,
        ),
      }),
    );

    expect(line).toMatch(/resolvers=\S*,\+\d+/);
  });

  it('should log the request id forwarded by the ingress', () => {
    const line = runAndCaptureLine(
      buildRequest({ headers: { 'x-request-id': 'req-abc' } }),
    );

    expect(line).toContain('request_id=req-abc');
  });

  it('should log the trace ids of the active span', () => {
    computeRequestTraceContextMock.mockReturnValue({
      traceId: 'trace-abc',
      spanId: 'span-abc',
      sampled: true,
    });

    const line = runAndCaptureLine(buildRequest());

    expect(line).toContain('trace_id=trace-abc');
    expect(line).toContain('span_id=span-abc');
    expect(line).toContain('trace_sampled=true');
  });

  it('should log an unsampled trace as such', () => {
    computeRequestTraceContextMock.mockReturnValue({
      traceId: 'trace-abc',
      spanId: 'span-abc',
      sampled: false,
    });

    expect(runAndCaptureLine(buildRequest())).toContain('trace_sampled=false');
  });

  it('should omit the trace ids when no span is active', () => {
    computeRequestTraceContextMock.mockReturnValue(undefined);

    const line = runAndCaptureLine(buildRequest());

    expect(line).not.toContain('trace_id=');
    expect(line).not.toContain('span_id=');
  });

  it('should log an aborted request, where finish never fires', () => {
    const { response, close } = buildResponse();

    middleware.use(buildRequest(), response, next);
    close();

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('url_path=/rest/people/ba91bdfb');
  });

  it('should log a request once when both finish and close fire', () => {
    const { response, finish, close } = buildResponse();

    middleware.use(buildRequest(), response, next);
    finish();
    close();

    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('should never let a failure to build the line escape the handler', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const request = buildRequest();

    Object.defineProperty(request, 'originalUrl', {
      get: () => {
        throw new Error('boom');
      },
    });

    const { response, finish } = buildResponse();

    middleware.use(request, response, next);

    expect(() => finish()).not.toThrow();
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to build the access log line'),
    );
  });
});
