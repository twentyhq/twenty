import { generateArgsInput } from 'src/tenant/entity-resolver/utils/generate-args-input.util';
import { stringifyWithoutKeyQuote } from 'src/tenant/entity-resolver/utils/stringify-without-key-quote.util';

describe('generateArgsInput', () => {
  it('should handle string inputs', () => {
    const args = { someKey: 'someValue' };

    expect(generateArgsInput(args)).toBe('someKey: "someValue"');
  });

  it('should handle number inputs', () => {
    const args = { someKey: 123 };

    expect(generateArgsInput(args)).toBe('someKey: 123');
  });

  it('should handle boolean inputs', () => {
    const args = { someKey: true };

    expect(generateArgsInput(args)).toBe('someKey: true');
  });

  it('should skip undefined values', () => {
    const args = { definedKey: 'value', undefinedKey: undefined };

    expect(generateArgsInput(args)).toBe('definedKey: "value"');
  });

  it('should handle object inputs', () => {
    const args = { someKey: { nestedKey: 'nestedValue' } };

    expect(generateArgsInput(args)).toBe('someKey: {nestedKey: "nestedValue"}');
    expect(stringifyWithoutKeyQuote).toHaveBeenCalledWith({
      nestedKey: 'nestedValue',
    });
  });

  it('should handle null inputs', () => {
    const args = { someKey: null };

    expect(generateArgsInput(args)).toBe('someKey: null');
  });

  it('should remove trailing commas', () => {
    const args = { firstKey: 'firstValue', secondKey: 'secondValue' };

    expect(generateArgsInput(args)).toBe(
      'firstKey: "firstValue", secondKey: "secondValue"',
    );
  });
});
