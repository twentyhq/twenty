import { hasWorkflowOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/has-workflow-output-schema.util';

describe('hasWorkflowOutputSchema', () => {
  it('should return false for null or undefined settings', () => {
    expect(hasWorkflowOutputSchema(null)).toBe(false);
    expect(hasWorkflowOutputSchema(undefined)).toBe(false);
  });

  it('should return false when neither schema is present', () => {
    expect(hasWorkflowOutputSchema({})).toBe(false);
  });

  it('should return true for a non-empty expectedOutputSchema', () => {
    expect(
      hasWorkflowOutputSchema({ expectedOutputSchema: { field: 'value' } }),
    ).toBe(true);
  });

  it('should return false for an empty expectedOutputSchema', () => {
    expect(hasWorkflowOutputSchema({ expectedOutputSchema: {} })).toBe(false);
  });

  it('should return true for a non-empty outputSchema', () => {
    expect(hasWorkflowOutputSchema({ outputSchema: { field: 'value' } })).toBe(
      true,
    );
  });

  it('should return false for an empty outputSchema', () => {
    expect(hasWorkflowOutputSchema({ outputSchema: {} })).toBe(false);
  });

  it('should reject a LINK output schema as not being a real schema', () => {
    expect(
      hasWorkflowOutputSchema({
        outputSchema: {
          _outputSchemaType: 'LINK',
          href: 'https://example.com',
        },
      }),
    ).toBe(false);
  });

  it('should prefer expectedOutputSchema over a LINK output schema', () => {
    expect(
      hasWorkflowOutputSchema({
        expectedOutputSchema: { field: 'value' },
        outputSchema: { _outputSchemaType: 'LINK' },
      }),
    ).toBe(true);
  });

  it('should return false for non-object schema values', () => {
    expect(hasWorkflowOutputSchema({ outputSchema: 'not-an-object' })).toBe(
      false,
    );
    expect(hasWorkflowOutputSchema({ expectedOutputSchema: 42 })).toBe(false);
  });
});
