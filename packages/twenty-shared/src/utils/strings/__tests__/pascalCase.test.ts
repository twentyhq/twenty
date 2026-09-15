import { pascalCase } from '@/utils/strings/pascalCase';

describe('pascalCase', () => {
  it('converts a string to pascal case', () => {
    const input = 'HELLO_WORLD';

    const result = pascalCase(input);

    expect(result).toBe('HelloWorld');
  });

  it('handles empty strings', () => {
    const input = '';

    const result = pascalCase(input);

    expect(result).toBe('');
  });

  it('handles strings with only one word', () => {
    const input = 'hello';

    const result = pascalCase(input);

    expect(result).toBe('Hello');
  });

  it('handles strings with several words, spaces and special characters', () => {
    const input = '& Hello world! How are you today? #';

    const result = pascalCase(input);

    expect(result).toBe('HelloWorldHowAreYouToday');
  });

  it('handles strings with leading and trailing spaces', () => {
    const input = '  hello_world  ';

    const result = pascalCase(input);

    expect(result).toBe('HelloWorld');
  });
});
