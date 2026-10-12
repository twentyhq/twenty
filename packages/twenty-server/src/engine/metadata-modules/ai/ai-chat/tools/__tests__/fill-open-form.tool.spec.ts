import { createFillOpenFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/fill-open-form.tool';

const OPEN_FORM = {
  formId: 'form-1',
  description: 'Validation rule on the Company object',
  fields: [
    { name: 'name', description: 'Short rule name' },
    { name: 'expression', description: 'Condition to save a record' },
  ],
};

describe('fill_open_form tool', () => {
  it('only accepts the fields of the open form', () => {
    const tool = createFillOpenFormTool(OPEN_FORM);

    expect(
      tool.inputSchema.safeParse({ values: { name: 'Domain required' } })
        .success,
    ).toBe(true);
    expect(tool.inputSchema.shape.values.shape.expression.description).toBe(
      'Condition to save a record',
    );
    expect(Object.keys(tool.inputSchema.shape.values.shape)).toEqual([
      'name',
      'expression',
    ]);
  });

  it('returns the values for the open form without saving anything', async () => {
    const tool = createFillOpenFormTool(OPEN_FORM);

    await expect(
      tool.execute({ values: { name: 'Domain required' } }),
    ).resolves.toEqual({
      success: true,
      message:
        'The values are in the open form. Nothing is saved until the user saves it.',
      result: { formId: 'form-1', values: { name: 'Domain required' } },
    });
  });
});
