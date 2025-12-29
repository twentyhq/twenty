import { resolveRichTextVariables } from '../rich-text-variable-resolver';

describe('resolveRichTextVariables', () => {
  const context = {
    step1: {
      message: 'Hello World',
      name: 'John',
    },
    user: {
      email: 'john@example.com',
    },
  };

  it('should resolve a single variableTag node', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Hello World"}]}]',
    );
  });

  it('should resolve variableTag nodes mixed with text', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"text","text":"Message: "},{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}},{"type":"text","text":" from user"}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Message: "},{"type":"text","text":"Hello World"},{"type":"text","text":" from user"}]}]',
    );
  });

  it('should resolve multiple variableTag nodes', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.name}}"}},{"type":"text","text":" - "},{"type":"variableTag","attrs":{"variable":"{{user.email}}"}}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"John"},{"type":"text","text":" - "},{"type":"text","text":"john@example.com"}]}]',
    );
  });

  it('should handle undefined variables by replacing with empty string', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{nonexistent.field}}"}}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":""}]}]',
    );
  });

  it('should escape special characters in resolved values', () => {
    const contextWithSpecialChars = {
      step1: {
        message: 'Hello "World" with \\ backslash',
      },
    };

    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}}]}]';

    const result = resolveRichTextVariables(input, contextWithSpecialChars);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Hello \\"World\\" with \\\\ backslash"}]}]',
    );
  });

  it('should not modify strings without variableTag nodes', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"text","text":"Plain text content"}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(input);
  });

  it('should handle doc type structure', () => {
    const input =
      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}}]}]}';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello World"}]}]}',
    );
  });

  it('should handle null context values by replacing with empty string', () => {
    const contextWithNull = {
      step1: {
        value: null,
      },
    };

    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.value}}"}}]}]';

    const result = resolveRichTextVariables(input, contextWithNull);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":""}]}]',
    );
  });

  it('should handle numeric values', () => {
    const contextWithNumber = {
      step1: {
        count: 42,
      },
    };

    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.count}}"}}]}]';

    const result = resolveRichTextVariables(input, contextWithNumber);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"42"}]}]',
    );
  });

  it('should preserve regular {{variable}} patterns in non-variableTag contexts', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"text","text":"Regular {{step1.message}} pattern"}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(input);
  });

  it('should return undefined for undefined input', () => {
    const result = resolveRichTextVariables(undefined, context);

    expect(result).toBeUndefined();
  });

  it('should resolve variableTag nodes with attrs before type (alternate JSON order)', () => {
    const input =
      '[{"type":"paragraph","content":[{"attrs":{"variable":"{{step1.message}}"},"type":"variableTag"}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Hello World"}]}]',
    );
  });

  it('should resolve mixed property order variableTag nodes', () => {
    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.name}}"}},{"attrs":{"variable":"{{user.email}}"},"type":"variableTag"}]}]';

    const result = resolveRichTextVariables(input, context);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"John"},{"type":"text","text":"john@example.com"}]}]',
    );
  });

  it('should convert newlines to hardBreak nodes', () => {
    const contextWithNewlines = {
      step1: {
        message: 'Hello\nWorld',
      },
    };

    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}}]}]';

    const result = resolveRichTextVariables(input, contextWithNewlines);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Hello"},{"type":"hardBreak"},{"type":"text","text":"World"}]}]',
    );
  });

  it('should handle multiple newlines', () => {
    const contextWithMultipleNewlines = {
      step1: {
        message: 'Line 1\nLine 2\nLine 3',
      },
    };

    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}}]}]';

    const result = resolveRichTextVariables(input, contextWithMultipleNewlines);

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Line 1"},{"type":"hardBreak"},{"type":"text","text":"Line 2"},{"type":"hardBreak"},{"type":"text","text":"Line 3"}]}]',
    );
  });

  it('should handle newlines with special characters', () => {
    const contextWithNewlinesAndSpecialChars = {
      step1: {
        message: 'Hello "World"\nGoodbye',
      },
    };

    const input =
      '[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{step1.message}}"}}]}]';

    const result = resolveRichTextVariables(
      input,
      contextWithNewlinesAndSpecialChars,
    );

    expect(result).toBe(
      '[{"type":"paragraph","content":[{"type":"text","text":"Hello \\"World\\""},{"type":"hardBreak"},{"type":"text","text":"Goodbye"}]}]',
    );
  });
});
