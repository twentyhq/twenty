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
});
