import { generateArgsInput } from 'src/tenant/entity-resolver/utils/generate-args-input.util';

const normalizeWhitespace = (str) => str.replace(/\s+/g, '');

describe('generateArgsInput', () => {
  it('should handle string inputs', () => {
    const args = { someKey: 'someValue' };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('someKey: "someValue"'),
    );
  });

  it('should handle number inputs', () => {
    const args = { someKey: 123 };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('someKey: 123'),
    );
  });

  it('should handle boolean inputs', () => {
    const args = { someKey: true };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('someKey: true'),
    );
  });

  it('should skip undefined values', () => {
    const args = { definedKey: 'value', undefinedKey: undefined };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('definedKey: "value"'),
    );
  });

  it('should handle object inputs', () => {
    const args = { someKey: { nestedKey: 'nestedValue' } };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('someKey: {nestedKey: "nestedValue"}'),
    );
  });

  it('should handle null inputs', () => {
    const args = { someKey: null };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('someKey: null'),
    );
  });

  it('should remove trailing commas', () => {
    const args = { firstKey: 'firstValue', secondKey: 'secondValue' };

    expect(normalizeWhitespace(generateArgsInput(args))).toBe(
      normalizeWhitespace('firstKey: "firstValue", secondKey: "secondValue"'),
    );
  });
});
