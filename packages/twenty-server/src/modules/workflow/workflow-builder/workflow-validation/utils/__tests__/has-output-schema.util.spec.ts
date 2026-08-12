import { hasOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-output-schema.util';

describe('hasOutputSchema', () => {
  it('should return false for null or undefined settings', () => {
    expect(hasOutputSchema(null)).toBe(false);
    expect(hasOutputSchema(undefined)).toBe(false);
  });

  it('should return false when neither schema is present', () => {
    expect(hasOutputSchema({})).toBe(false);
  });

  it('should return true for a non-empty expectedOutputSchema', () => {
    expect(hasOutputSchema({ expectedOutputSchema: { field: 'value' } })).toBe(
      true,
    );
  });

  it('should return false for an empty expectedOutputSchema', () => {
    expect(hasOutputSchema({ expectedOutputSchema: {} })).toBe(false);
  });

  it('should return true for a non-empty outputSchema', () => {
    expect(hasOutputSchema({ outputSchema: { field: 'value' } })).toBe(true);
  });

  it('should return false for an empty outputSchema', () => {
    expect(hasOutputSchema({ outputSchema: {} })).toBe(false);
  });

  it('should reject a LINK output schema as not being a real schema', () => {
    expect(
      hasOutputSchema({
        outputSchema: {
          _outputSchemaType: 'LINK',
          href: 'https://example.com',
        },
      }),
    ).toBe(false);
  });

  it('should prefer expectedOutputSchema over a LINK output schema', () => {
    expect(
      hasOutputSchema({
        expectedOutputSchema: { field: 'value' },
        outputSchema: { _outputSchemaType: 'LINK' },
      }),
    ).toBe(true);
  });

  it('should return false for non-object schema values', () => {
    expect(hasOutputSchema({ outputSchema: 'not-an-object' })).toBe(false);
    expect(hasOutputSchema({ expectedOutputSchema: 42 })).toBe(false);
  });
});
