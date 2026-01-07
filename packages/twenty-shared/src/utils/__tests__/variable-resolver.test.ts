import { resolveInput } from '../variable-resolver';

describe('resolveInput', () => {
  const context = {
    user: {
      name: 'John Doe',
      age: 30,
    },
    settings: {
      theme: 'dark',
      notifications: true,
    },
    specialValues: {
      nullValue: null,
      undefinedValue: undefined,
      emptyString: '',
      zero: 0,
      booleanFalse: false,
      booleanTrue: true,
    },
  };

  it('should return null for null input', () => {
    expect(resolveInput(null, context)).toBeNull();
  });

  it('should support special values', () => {
    expect(resolveInput('{{specialValues.nullValue}}', context)).toBeNull();
    expect(
      resolveInput('{{specialValues.undefinedValue}}', context),
    ).toBeUndefined();
    expect(resolveInput('{{specialValues.emptyString}}', context)).toBe('');
    expect(resolveInput('{{specialValues.zero}}', context)).toBe(0);
    expect(resolveInput('{{specialValues.booleanFalse}}', context)).toBe(false);
    expect(resolveInput('{{specialValues.booleanTrue}}', context)).toBe(true);
  });

  it('should return undefined for undefined input', () => {
    expect(resolveInput(undefined, context)).toBeUndefined();
  });

  it('should resolve a simple string variable', () => {
    expect(resolveInput('{{user.name}}', context)).toBe('John Doe');
  });

  it('should resolve multiple variables in a string', () => {
    expect(
      resolveInput('Name: {{user.name}}, Age: {{user.age}}', context),
    ).toBe('Name: John Doe, Age: 30');
  });

  it('should handle non-existent variables', () => {
    expect(resolveInput('{{user.email}}', context)).toBe(undefined);
  });

  it('should resolve variables in an array', () => {
    const input = ['{{user.name}}', '{{settings.theme}}', 'static'];
    const expected = ['John Doe', 'dark', 'static'];

    expect(resolveInput(input, context)).toEqual(expected);
  });

  it('should resolve variables in an object', () => {
    const input = {
      name: '{{user.name}}',
      theme: '{{settings.theme}}',
      static: 'value',
    };
    const expected = {
      name: 'John Doe',
      theme: 'dark',
      static: 'value',
    };

    expect(resolveInput(input, context)).toEqual(expected);
  });

  it('should handle nested objects and arrays', () => {
    const input = {
      user: {
        displayName: '{{user.name}}',
        preferences: ['{{settings.theme}}', '{{settings.notifications}}'],
      },
      staticData: [1, 2, 3],
    };
    const expected = {
      user: {
        displayName: 'John Doe',
        preferences: ['dark', true],
      },
      staticData: [1, 2, 3],
    };

    expect(resolveInput(input, context)).toEqual(expected);
  });

  it('does not wrap string variables with double quotes', () => {
    expect(
      resolveInput('{ {{test}}: 2 }', {
        test: 'prop',
      }),
    ).toBe('{ prop: 2 }');
  });

  it('does not modify static JSON', () => {
    expect(resolveInput('{ "a": 2 }', {})).toBe('{ "a": 2 }');
  });

  it('supports variable as JSON object property name', () => {
    expect(
      resolveInput('{ "{{test}}": 2 }', {
        test: 'prop',
      }),
    ).toBe('{ "prop": 2 }');
  });

  it('supports variable as JSON number value', () => {
    expect(
      resolveInput('{ "a": {{test}} }', {
        test: 2,
      }),
    ).toBe('{ "a": 2 }');
  });

  it('supports variable as JSON string value', () => {
    expect(
      resolveInput('{ "a": "{{test}}" }', {
        test: 'str',
      }),
    ).toBe('{ "a": "str" }');
  });
});
