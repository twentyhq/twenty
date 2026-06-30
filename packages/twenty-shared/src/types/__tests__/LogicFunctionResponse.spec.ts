import {
  isLogicFunctionHttpResponse,
  LOGIC_FUNCTION_HTTP_RESPONSE_MARKER,
} from '../LogicFunctionResponse';

describe('isLogicFunctionHttpResponse', () => {
  it('returns true when the marker is present and true', () => {
    expect(
      isLogicFunctionHttpResponse({
        [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
        body: { ok: true },
        status: 201,
      }),
    ).toBe(true);
  });

  it('returns false for a plain object with body/status keys but no marker', () => {
    expect(isLogicFunctionHttpResponse({ body: 'x', status: 200 })).toBe(false);
  });

  it.each([null, undefined, 'string', 42, true])(
    'returns false for non-object value %p',
    (value) => {
      expect(isLogicFunctionHttpResponse(value)).toBe(false);
    },
  );

  it('returns false when the marker is not strictly true', () => {
    expect(
      isLogicFunctionHttpResponse({
        [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: 'yes',
        body: null,
      }),
    ).toBe(false);
  });

  it('returns true when status and headers are absent', () => {
    expect(
      isLogicFunctionHttpResponse({
        [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
        body: { ok: true },
      }),
    ).toBe(true);
  });

  it('returns true for valid status and headers', () => {
    expect(
      isLogicFunctionHttpResponse({
        [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
        body: 'ok',
        status: 204,
        headers: { 'Content-Type': 'text/plain', 'X-Custom': 'foo' },
      }),
    ).toBe(true);
  });

  it.each([
    ['a string', 'oops'],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['a non-integer', 200.5],
    ['below the http range', 99],
    ['above the http range', 600],
  ])('returns false when status is %s', (_label, status) => {
    expect(
      isLogicFunctionHttpResponse({
        [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
        body: null,
        status,
      }),
    ).toBe(false);
  });

  it.each([
    ['a string', 'oops'],
    ['an array', ['a', 'b']],
    ['null', null],
    ['a record with a non-string value', { 'Content-Length': 42 }],
  ])('returns false when headers is %s', (_label, headers) => {
    expect(
      isLogicFunctionHttpResponse({
        [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
        body: null,
        headers,
      }),
    ).toBe(false);
  });
});
