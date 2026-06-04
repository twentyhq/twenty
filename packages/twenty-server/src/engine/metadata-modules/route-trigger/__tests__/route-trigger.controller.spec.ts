import { type Response } from 'express';
import { HTTPMethod } from 'twenty-shared/types';

import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { RouteTriggerController } from 'src/engine/metadata-modules/route-trigger/route-trigger.controller';

const createResponseMock = () => {
  const headers: Record<string, string> = {};

  return {
    status: jest.fn(),
    setHeader: jest.fn((key: string, value: string) => {
      headers[key.toLowerCase()] = value;
    }),
    getHeader: jest.fn((key: string) => headers[key.toLowerCase()]),
    send: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
};

describe('RouteTriggerController', () => {
  let controller: RouteTriggerController;
  const handle = jest.fn();

  beforeEach(() => {
    const routeTriggerService = { handle } as unknown as RouteTriggerService;

    controller = new RouteTriggerController(routeTriggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates to the service with the POST http method and applies status 200', async () => {
    const request = { path: '/s/webhooks/google/leads' } as never;
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });

    await controller.post(request, response);

    expect(handle).toHaveBeenCalledWith({
      request,
      httpMethod: HTTPMethod.POST,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ ok: true });
  });

  it('applies the status code and headers from the service result', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 201,
      headers: { 'Content-Type': 'text/html', 'X-Custom': 'foo' },
      body: '<h1>Hi</h1>',
    });

    await controller.get({} as never, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/html',
    );
    expect(response.setHeader).toHaveBeenCalledWith('X-Custom', 'foo');
    expect(response.send).toHaveBeenCalledWith('<h1>Hi</h1>');
  });

  it('sends an empty response when the body is nil', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({ statusCode: 200, headers: {}, body: null });

    await controller.get({} as never, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith();
    expect(response.json).not.toHaveBeenCalled();
  });

  it('defaults a string body content-type to text/plain when none is set', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({ statusCode: 200, headers: {}, body: 'plain' });

    await controller.get({} as never, response);

    expect(response.setHeader).toHaveBeenCalledWith(
      'content-type',
      'text/plain',
    );
    expect(response.send).toHaveBeenCalledWith('plain');
  });

  it('sends an object body as JSON when no content-type is set', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });

    await controller.get({} as never, response);

    expect(response.json).toHaveBeenCalledWith({ ok: true });
  });

  it('pre-serializes an object body when a custom content-type is set', async () => {
    const response = createResponseMock();

    handle.mockResolvedValue({
      statusCode: 200,
      headers: { 'Content-Type': 'application/ld+json' },
      body: { ok: true },
    });

    await controller.get({} as never, response);

    expect(response.send).toHaveBeenCalledWith(JSON.stringify({ ok: true }));
    expect(response.json).not.toHaveBeenCalled();
  });
});
