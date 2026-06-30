import { extractPropertyPathFromVariable } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/extract-property-path-from-variable';

describe('extractPropertyPathFromVariable', () => {
  it('should extract single property path', () => {
    const result = extractPropertyPathFromVariable('{{step1.result}}');

    expect(result).toEqual(['result']);
  });

  it('should extract nested property path', () => {
    const result = extractPropertyPathFromVariable('{{step1.result.items}}');

    expect(result).toEqual(['result', 'items']);
  });

  it('should extract deeply nested property path', () => {
    const result = extractPropertyPathFromVariable(
      '{{step1.data.user.address.street}}',
    );

    expect(result).toEqual(['data', 'user', 'address', 'street']);
  });

  it('should handle variable without brackets', () => {
    const result = extractPropertyPathFromVariable('step1.result.items');

    expect(result).toEqual(['result', 'items']);
  });

  it('should return empty array for variable with only step id', () => {
    const result = extractPropertyPathFromVariable('{{step1}}');

    expect(result).toEqual([]);
  });

  it('should return empty array for variable with only step id without brackets', () => {
    const result = extractPropertyPathFromVariable('step1');

    expect(result).toEqual([]);
  });

  it('should handle complex step ids', () => {
    const result = extractPropertyPathFromVariable(
      '{{step_with_underscore.result.data}}',
    );

    expect(result).toEqual(['result', 'data']);
  });

  it('should handle numeric step ids', () => {
    const result = extractPropertyPathFromVariable('{{step123.output.value}}');

    expect(result).toEqual(['output', 'value']);
  });
});
