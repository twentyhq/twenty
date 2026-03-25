import { extractRawVariableNamePart } from '@/workflow/utils/extractRawVariableNameParts';

describe('extractRawVariableNamePart', () => {
  it('should extract stepId from a variable name', () => {
    const result = extractRawVariableNamePart({
      rawVariableName: '{{step1.output.field}}',
      part: 'stepId',
    });

    expect(result).toBe('step1');
  });

  it('should extract selectedField from a variable name', () => {
    const result = extractRawVariableNamePart({
      rawVariableName: '{{step1.output.field}}',
      part: 'selectedField',
    });

    expect(result).toBe('field');
  });

  it('should handle deeply nested variable names', () => {
    const result = extractRawVariableNamePart({
      rawVariableName: '{{trigger.output.nested.deep}}',
      part: 'selectedField',
    });

    expect(result).toBe('deep');
  });
});
