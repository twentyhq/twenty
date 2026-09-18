import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type NextFunction, type Request, type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ApiRequestLogMiddleware } from 'src/engine/middlewares/api-request-log.middleware';

describe('ApiRequestLogMiddleware', () => {
  let middleware: ApiRequestLogMiddleware;
  let logSpy: jest.SpyInstance;
  let next: NextFunction;
  let isEnabled: boolean;

  const buildRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      method: 'POST',
      originalUrl: '/rest/people/ba91bdfb?depth=1',
      ...overrides,
    }) as unknown as Request;

  const buildResponse = () => {
    const listeners: (() => void)[] = [];

    const response = {
      statusCode: 200,
      once: jest.fn((event: string, listener: () => void) => {
        if (event === 'finish') {
          listeners.push(listener);
        }
      }),
    } as unknown as Response;

    return { response, finish: () => listeners.forEach((l) => l()) };
  };

  const runAndCaptureLine = (request: Request): string => {
    const { response, finish } = buildResponse();

    middleware.use(request, response, next);
    finish();

    return logSpy.mock.calls.at(-1)?.[0] as string;
  };

  beforeEach(async () => {
    isEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiRequestLogMiddleware,
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn(() => isEnabled) },
        },
      ],
    }).compile();

    middleware = module.get<ApiRequestLogMiddleware>(ApiRequestLogMiddleware);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    next = jest.fn();
  });

  afterEach(() => {
    logSpy.mockRestore();
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

  it('should log the route without its query string', () => {
    const line = runAndCaptureLine(buildRequest());

    expect(line).toContain('method=POST');
    expect(line).toContain('route=/rest/people/ba91bdfb');
    expect(line).not.toContain('depth=1');
    expect(line).toContain('status=200');
  });

  it('should log the user as actor', () => {
    const line = runAndCaptureLine(
      buildRequest({
        user: { id: 'user-id' },
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
      } as unknown as Partial<Request>),
    );

    expect(line).toContain('actor=user');
    expect(line).toContain('userId=user-id');
    expect(line).toContain('workspaceId=workspace-id');
    expect(line).toContain('userWorkspaceId=user-workspace-id');
  });

  it('should prefer the api key over the user as actor', () => {
    const line = runAndCaptureLine(
      buildRequest({
        apiKey: { id: 'api-key-id' },
        user: { id: 'user-id' },
      } as unknown as Partial<Request>),
    );

    expect(line).toContain('actor=apiKey');
    expect(line).toContain('apiKeyId=api-key-id');
    expect(line).not.toContain('userId=');
  });

  it('should log anonymous when nothing authenticated the request', () => {
    expect(runAndCaptureLine(buildRequest())).toContain('actor=anonymous');
  });

  it('should log the graphql operation name', () => {
    const line = runAndCaptureLine(
      buildRequest({
        originalUrl: '/graphql',
        body: { operationName: 'FindManyPeople' },
      }),
    );

    expect(line).toContain('route=/graphql');
    expect(line).toContain('operations=FindManyPeople');
  });

  it('should log every operation name of a batched graphql request', () => {
    const line = runAndCaptureLine(
      buildRequest({
        originalUrl: '/graphql',
        body: [
          { operationName: 'FindManyPeople' },
          { operationName: 'FindManyCompanies' },
        ],
      }),
    );

    expect(line).toContain('operations=FindManyPeople,FindManyCompanies');
  });

  it('should omit operations when the body carries no operation name', () => {
    const line = runAndCaptureLine(
      buildRequest({ originalUrl: '/graphql', body: { query: '{ me }' } }),
    );

    expect(line).not.toContain('operations=');
  });

  it('should log the impersonator', () => {
    const line = runAndCaptureLine(
      buildRequest({
        user: { id: 'user-id' },
        impersonationContext: {
          impersonatorUserWorkspaceId: 'impersonator-id',
        },
      } as unknown as Partial<Request>),
    );

    expect(line).toContain('impersonatorUserWorkspaceId=impersonator-id');
  });
});
