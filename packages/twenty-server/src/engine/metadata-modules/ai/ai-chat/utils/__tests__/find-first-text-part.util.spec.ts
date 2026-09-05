import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { findFirstTextPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-first-text-part.util';

const buildParts = (parts: unknown[]): ExtendedUIMessage['parts'] =>
  parts as ExtendedUIMessage['parts'];

describe('findFirstTextPart', () => {
  it('should return undefined when there are no parts at all', () => {
    expect(findFirstTextPart(buildParts([]))).toBeUndefined();
  });

  it('should return undefined when no part carries text', () => {
    const result = findFirstTextPart(
      buildParts([
        { type: 'reasoning', text: 'thinking out loud' },
        { type: 'tool-call', toolName: 'search' },
      ]),
    );

    expect(result).toBeUndefined();
  });

  it('should skip an empty text part and take the first one with content', () => {
    const result = findFirstTextPart(
      buildParts([
        { type: 'text', text: '' },
        { type: 'text', text: 'the real answer' },
      ]),
    );

    expect(result).toBe('the real answer');
  });

  it('should skip a whitespace only text part', () => {
    const result = findFirstTextPart(
      buildParts([
        { type: 'text', text: '   ' },
        { type: 'text', text: 'the real answer' },
      ]),
    );

    expect(result).toBe('the real answer');
  });

  it('should take the first text part when several carry content', () => {
    const result = findFirstTextPart(
      buildParts([
        { type: 'text', text: 'first' },
        { type: 'text', text: 'second' },
      ]),
    );

    expect(result).toBe('first');
  });

  it('should truncate a long preview to 200 characters', () => {
    const longText = 'a'.repeat(500);

    const result = findFirstTextPart(
      buildParts([{ type: 'text', text: longText }]),
    );

    expect(result).toHaveLength(200);
    expect(result).toBe('a'.repeat(200));
  });

  it('should leave a preview shorter than the cap untouched', () => {
    const result = findFirstTextPart(
      buildParts([{ type: 'text', text: 'short enough' }]),
    );

    expect(result).toBe('short enough');
  });
});
