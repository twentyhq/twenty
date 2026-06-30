import { extractVariablesFromInput } from '../extract-variables-from-input.util';

describe('extractVariablesFromInput', () => {
  it('should return an empty array for non-string, non-object input', () => {
    expect(extractVariablesFromInput(undefined)).toEqual([]);
    expect(extractVariablesFromInput(null)).toEqual([]);
    expect(extractVariablesFromInput(42)).toEqual([]);
  });

  it('should extract a single variable from a string', () => {
    expect(extractVariablesFromInput('Hello {{step1.name}}')).toEqual([
      'step1.name',
    ]);
  });

  it('should extract every variable across nested objects and arrays', () => {
    const input = {
      greeting: 'Hi {{trigger.email}}',
      nested: { message: 'X {{step2.value}} Y {{step3.id}}' },
      list: ['{{step4.foo}}'],
    };

    expect(extractVariablesFromInput(input)).toEqual([
      'trigger.email',
      'step2.value',
      'step3.id',
      'step4.foo',
    ]);
  });

  it('should return an empty array when no variables are present', () => {
    expect(extractVariablesFromInput({ a: 'plain text', b: 5 })).toEqual([]);
  });
});
