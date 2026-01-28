import { type Request } from 'express';

import {
  buildLogicFunctionEvent,
  extractBody,
  filterRequestHeaders,
  normalizePathParameters,
  normalizeQueryStringParameters,
} from 'src/engine/metadata-modules/route-trigger/utils/build-logic-function-event.util';

describe('filterRequestHeaders', () => {
  it('should filter headers based on allowed names', () => {
    const requestHeaders = {
      'content-type': 'application/json',
      authorization: 'Bearer token123',
      'x-custom-header': 'custom-value',
      'user-agent': 'test-agent',
    };
    const forwardedRequestHeaders = ['content-type', 'authorization'];

    const result = filterRequestHeaders({
      requestHeaders,
      forwardedRequestHeaders,
    });

    expect(result).toEqual({
      'content-type': 'application/json',
      authorization: 'Bearer token123',
    });
  });

  it('should handle case-insensitive header names', () => {
    const requestHeaders = {
      'content-type': 'application/json',
      authorization: 'Bearer token123',
    };
    const forwardedRequestHeaders = ['Content-Type', 'AUTHORIZATION'];

    const result = filterRequestHeaders({
      requestHeaders,
      forwardedRequestHeaders,
    });

    expect(result).toEqual({
      'content-type': 'application/json',
      authorization: 'Bearer token123',
    });
  });

  it('should return empty object when no headers match', () => {
    const requestHeaders = {
      'content-type': 'application/json',
    };
    const forwardedRequestHeaders = ['x-custom-header'];

    const result = filterRequestHeaders({
      requestHeaders,
      forwardedRequestHeaders,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when forwardedRequestHeaders is empty', () => {
    const requestHeaders = {
      'content-type': 'application/json',
    };

    const result = filterRequestHeaders({
      requestHeaders,
      forwardedRequestHeaders: [],
    });

    expect(result).toEqual({});
  });

  it('should convert array header values to comma-separated string', () => {
    const requestHeaders = {
      'x-custom-array-header': ['value1', 'value2', 'value3'],
    };
    const forwardedRequestHeaders = ['x-custom-array-header'];

    const result = filterRequestHeaders({
      requestHeaders,
      forwardedRequestHeaders,
    });

    expect(result).toEqual({
      'x-custom-array-header': 'value1, value2, value3',
    });
  });

  it('should skip undefined header values', () => {
    const requestHeaders = {
      'content-type': 'application/json',
      'x-missing': undefined,
    };
    const forwardedRequestHeaders = ['content-type', 'x-missing'];

    const result = filterRequestHeaders({
      requestHeaders,
      forwardedRequestHeaders,
    });

    expect(result).toEqual({
      'content-type': 'application/json',
    });
  });
});

describe('extractBody', () => {
  it('should return null for undefined body', () => {
    const request = { body: undefined } as Request;

    const result = extractBody(request);

    expect(result).toBeNull();
  });

  it('should return null for null body', () => {
    const request = { body: null } as unknown as Request;

    const result = extractBody(request);

    expect(result).toBeNull();
  });

  it('should parse string body as JSON', () => {
    const request = { body: '{"key":"value"}' } as unknown as Request;

    const result = extractBody(request);

    expect(result).toEqual({ key: 'value' });
  });

  it('should wrap non-JSON string body in raw property', () => {
    const request = { body: 'plain text body' } as unknown as Request;

    const result = extractBody(request);

    expect(result).toEqual({ raw: 'plain text body' });
  });

  it('should return object body as-is (parsed JSON)', () => {
    const request = {
      body: { key: 'value', nested: { foo: 'bar' } },
    } as Request;

    const result = extractBody(request);

    expect(result).toEqual({ key: 'value', nested: { foo: 'bar' } });
  });

  it('should parse Buffer body as JSON', () => {
    const request = {
      body: Buffer.from('{"buffered":"json"}'),
    } as unknown as Request;

    const result = extractBody(request);

    expect(result).toEqual({ buffered: 'json' });
  });

  it('should wrap non-JSON Buffer body in raw property', () => {
    const request = {
      body: Buffer.from('buffer content'),
    } as unknown as Request;

    const result = extractBody(request);

    expect(result).toEqual({ raw: 'buffer content' });
  });

  it('should handle empty object body', () => {
    const request = { body: {} } as Request;

    const result = extractBody(request);

    expect(result).toEqual({});
  });

  it('should handle array body', () => {
    const request = { body: [1, 2, 3] } as unknown as Request;

    const result = extractBody(request);

    expect(result).toEqual([1, 2, 3]);
  });
});

describe('normalizeQueryStringParameters', () => {
  it('should handle simple string parameters', () => {
    const query = { page: '1', limit: '10' };

    const result = normalizeQueryStringParameters(query);

    expect(result).toEqual({ page: '1', limit: '10' });
  });

  it('should join array parameters with commas', () => {
    const query = { ids: ['1', '2', '3'] };

    const result = normalizeQueryStringParameters(query);

    expect(result).toEqual({ ids: '1,2,3' });
  });

  it('should skip undefined parameters', () => {
    const query = { page: '1', missing: undefined };

    const result = normalizeQueryStringParameters(query);

    expect(result).toEqual({ page: '1' });
  });

  it('should handle empty query object', () => {
    const query = {};

    const result = normalizeQueryStringParameters(query);

    expect(result).toEqual({});
  });

  it('should stringify nested objects', () => {
    const query = { filter: { name: 'test' } as unknown as string };

    const result = normalizeQueryStringParameters(query);

    expect(result).toEqual({ filter: '{"name":"test"}' });
  });

  it('should filter non-string values from arrays and join with commas', () => {
    const query = { ids: ['1', undefined as unknown as string, '2'] };

    const result = normalizeQueryStringParameters(query);

    expect(result).toEqual({ ids: '1,2' });
  });
});

describe('normalizePathParameters', () => {
  it('should handle simple string parameters', () => {
    const pathParams = { id: '123', slug: 'test' };

    const result = normalizePathParameters(pathParams);

    expect(result).toEqual({ id: '123', slug: 'test' });
  });

  it('should join array parameters with commas', () => {
    const pathParams = { ids: ['1', '2', '3'] };

    const result = normalizePathParameters(pathParams);

    expect(result).toEqual({ ids: '1,2,3' });
  });

  it('should skip undefined parameters', () => {
    const pathParams = { id: '123', missing: undefined };

    const result = normalizePathParameters(pathParams);

    expect(result).toEqual({ id: '123' });
  });

  it('should handle empty object', () => {
    const pathParams = {};

    const result = normalizePathParameters(pathParams);

    expect(result).toEqual({});
  });
});

describe('buildLogicFunctionEvent', () => {
  const createMockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      headers: {},
      query: {},
      body: undefined,
      method: 'GET',
      path: '/test',
      ...overrides,
    }) as Request;

  it('should build a complete event from Express request', () => {
    const request = createMockRequest({
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token',
        'user-agent': 'test',
      },
      query: { page: '1' },
      body: { data: 'test' },
      method: 'POST',
      path: '/s/users/123',
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: { id: '123' },
      forwardedRequestHeaders: ['content-type', 'authorization'],
    });

    expect(result).toEqual({
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token',
      },
      queryStringParameters: { page: '1' },
      pathParameters: { id: '123' },
      body: { data: 'test' },
      isBase64Encoded: false,
      requestContext: {
        http: {
          method: 'POST',
          path: '/s/users/123',
        },
      },
    });
  });

  it('should preserve the request path as-is', () => {
    const request = createMockRequest({
      path: '/s/api/users',
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders: [],
    });

    expect(result.requestContext.http.path).toBe('/s/api/users');
  });

  it('should preserve path without prefix', () => {
    const request = createMockRequest({
      path: '/api/users',
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders: [],
    });

    expect(result.requestContext.http.path).toBe('/api/users');
  });

  it('should handle GET request with no body', () => {
    const request = createMockRequest({
      method: 'GET',
      query: { search: 'test' },
      body: undefined,
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders: [],
    });

    expect(result.body).toBeNull();
    expect(result.queryStringParameters).toEqual({ search: 'test' });
  });

  it('should handle DELETE request with path parameters', () => {
    const request = createMockRequest({
      method: 'DELETE',
      path: '/s/users/456',
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: { userId: '456' },
      forwardedRequestHeaders: [],
    });

    expect(result.requestContext.http.method).toBe('DELETE');
    expect(result.pathParameters).toEqual({ userId: '456' });
  });

  it('should filter only allowed headers', () => {
    const request = createMockRequest({
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer secret',
        'x-api-key': 'key123',
        cookie: 'session=abc',
      },
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders: ['x-api-key'],
    });

    expect(result.headers).toEqual({
      'x-api-key': 'key123',
    });
    expect(result.headers['authorization']).toBeUndefined();
    expect(result.headers['cookie']).toBeUndefined();
  });

  it('should set isBase64Encoded to false', () => {
    const request = createMockRequest();

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders: [],
    });

    expect(result.isBase64Encoded).toBe(false);
  });

  it('should handle complex path parameters', () => {
    const request = createMockRequest({
      path: '/s/organizations/org1/users/user1/posts',
    });

    const result = buildLogicFunctionEvent({
      request,
      pathParameters: {
        orgId: 'org1',
        userId: 'user1',
      },
      forwardedRequestHeaders: [],
    });

    expect(result.pathParameters).toEqual({
      orgId: 'org1',
      userId: 'user1',
    });
  });
});
