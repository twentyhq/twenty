import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type NextFunction, type Request, type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ApiAccessLogMiddleware } from 'src/engine/middlewares/api-access-log.middleware';

describe('ApiAccessLogMiddleware', () => {
  let middleware: ApiAccessLogMiddleware;
  let logSpy: jest.SpyInstance;
  let next: NextFunction;
  let isEnabled: boolean;

  const buildRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      method: 'POST',
      originalUrl: '/rest/people/ba91bdfb',
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

  beforeEach(async () => {
    isEnabled = true;

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

  it('should not subscribe nor log when disabled', () => {
    isEnabled = false;

    const { response, finish } = buildResponse();

    middleware.use(buildRequest(), response, next);
    finish();

    expect(response.once).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should log when the response finishes', () => {
    const { response, finish } = buildResponse();

    middleware.use(buildRequest(), response, next);
    finish();

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('url_path=/rest/people/ba91bdfb');
    expect(next).toHaveBeenCalled();
  });

  it('should log an aborted request, where finish never fires', () => {
    const { response, close } = buildResponse();

    middleware.use(buildRequest(), response, next);
    close();

    expect(logSpy).toHaveBeenCalledTimes(1);
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
