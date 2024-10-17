import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

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
  };

  it('should return null for null input', () => {
    expect(resolveInput(null, context)).toBeNull();
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
    expect(resolveInput('{{user.email}}', context)).toBe('');
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
        preferences: ['dark', 'true'],
      },
      staticData: [1, 2, 3],
    };

    expect(resolveInput(input, context)).toEqual(expected);
  });

  it('should throw an error for invalid expressions', () => {
    expect(() => resolveInput('{{invalidFunction()}}', context)).toThrow();
  });
});
