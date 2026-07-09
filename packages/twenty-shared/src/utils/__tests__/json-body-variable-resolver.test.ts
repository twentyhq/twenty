import { resolveJsonBodyVariables } from '../json-body-variable-resolver';

describe('resolveJsonBodyVariables', () => {
  const context = {
    trigger: {
      handle: 'john@example.com',
      subject: 'Hello',
      count: 42,
    },
  };

  it('should resolve variables inside JSON string values', () => {
    const body = '{"toAddress":"{{trigger.handle}}"}';

    const result = resolveJsonBodyVariables(body, context);

    expect(result).toBe('{"toAddress":"john@example.com"}');
    expect(JSON.parse(result)).toEqual({ toAddress: 'john@example.com' });
  });

  it('should escape double quotes coming from resolved values', () => {
    const contextWithQuotes = {
      trigger: { subject: 'Say "hello" now' },
    };

    const body = '{"subject":"{{trigger.subject}}"}';

    const result = resolveJsonBodyVariables(body, contextWithQuotes);

    expect(JSON.parse(result)).toEqual({ subject: 'Say "hello" now' });
  });

  it('should escape newlines coming from resolved values', () => {
    const contextWithNewlines = {
      trigger: { text: 'line 1\nline 2' },
    };

    const body = '{"body":"{{trigger.text}}"}';

    const result = resolveJsonBodyVariables(body, contextWithNewlines);

    expect(JSON.parse(result)).toEqual({ body: 'line 1\nline 2' });
  });

  it('should escape backslashes coming from resolved values', () => {
    const contextWithBackslash = {
      trigger: { path: 'C:\\Users\\john' },
    };

    const body = '{"path":"{{trigger.path}}"}';

    const result = resolveJsonBodyVariables(body, contextWithBackslash);

    expect(JSON.parse(result)).toEqual({ path: 'C:\\Users\\john' });
  });

  it('should keep the JSON valid for multiline pretty-printed bodies', () => {
    const contextWithSpecialChars = {
      trigger: {
        handle: 'john@example.com',
        subject: 'Contains "quotes" and \\ backslash',
        text: 'Multi\nline\nbody',
      },
    };

    const body = `{
  "toAddress": "{{trigger.handle}}",
  "subject": "{{trigger.subject}}",
  "body": "{{trigger.text}}"
}`;

    const result = resolveJsonBodyVariables(body, contextWithSpecialChars);

    expect(JSON.parse(result)).toEqual({
      toAddress: 'john@example.com',
      subject: 'Contains "quotes" and \\ backslash',
      body: 'Multi\nline\nbody',
    });
  });

  it('should encode numbers as JSON when used outside of a string literal', () => {
    const body = '{"count":{{trigger.count}}}';

    const result = resolveJsonBodyVariables(body, context);

    expect(result).toBe('{"count":42}');
    expect(JSON.parse(result)).toEqual({ count: 42 });
  });

  it('should stringify numbers when used inside a string literal', () => {
    const body = '{"count":"{{trigger.count}}"}';

    const result = resolveJsonBodyVariables(body, context);

    expect(JSON.parse(result)).toEqual({ count: '42' });
  });

  it('should serialize object values as JSON inside a string literal', () => {
    const contextWithObject = {
      trigger: { payload: { foo: 'bar', count: 1 } },
    };

    const body = '{"payload":"{{trigger.payload}}"}';

    const result = resolveJsonBodyVariables(body, contextWithObject);

    expect(JSON.parse(result)).toEqual({
      payload: '{"foo":"bar","count":1}',
    });
  });

  it('should serialize object values as JSON outside of a string literal', () => {
    const contextWithObject = {
      trigger: { payload: { foo: 'bar' } },
    };

    const body = '{"payload":{{trigger.payload}}}';

    const result = resolveJsonBodyVariables(body, contextWithObject);

    expect(JSON.parse(result)).toEqual({ payload: { foo: 'bar' } });
  });

  it('should replace unresolved variables with an empty string inside a string literal', () => {
    const body = '{"toAddress":"{{trigger.unknown}}"}';

    const result = resolveJsonBodyVariables(body, context);

    expect(JSON.parse(result)).toEqual({ toAddress: '' });
  });

  it('should not modify bodies without variables', () => {
    const body = '{"static":"value"}';

    const result = resolveJsonBodyVariables(body, context);

    expect(result).toBe(body);
  });
});
