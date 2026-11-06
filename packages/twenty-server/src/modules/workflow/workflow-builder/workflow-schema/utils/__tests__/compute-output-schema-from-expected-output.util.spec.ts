import { computeOutputSchemaFromExpectedOutput } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-output-schema-from-expected-output.util';

const TOTAL_OUTPUT_SCHEMA = {
  total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
} as const;

describe('computeOutputSchemaFromExpectedOutput', () => {
  it('derives the schema from the sample', () => {
    expect(
      computeOutputSchemaFromExpectedOutput({
        expectedOutputSchema: { total: 3 },
        outputSchema: {},
      }),
    ).toEqual(TOTAL_OUTPUT_SCHEMA);
  });

  it('derives a schema from an array sample', () => {
    expect(
      computeOutputSchemaFromExpectedOutput({
        expectedOutputSchema: [{ id: 1 }],
        outputSchema: {},
      }),
    ).toEqual({
      0: {
        isLeaf: false,
        type: 'object',
        label: '0',
        value: { id: { isLeaf: true, type: 'number', label: 'id', value: 1 } },
      },
    });
  });

  it.each([
    { description: 'without a sample', expectedOutputSchema: {} },
    {
      description: 'next to a different hand-typed sample',
      expectedOutputSchema: { typed: 'by hand' },
    },
  ])(
    'keeps a legacy test result schema stored $description',
    ({ expectedOutputSchema }) => {
      expect(
        computeOutputSchemaFromExpectedOutput({
          expectedOutputSchema,
          outputSchema: TOTAL_OUTPUT_SCHEMA,
        }),
      ).toEqual(TOTAL_OUTPUT_SCHEMA);
    },
  );

  it('returns no schema for a sample the editor cleared', () => {
    expect(
      computeOutputSchemaFromExpectedOutput({
        expectedOutputSchema: {},
        outputSchema: {},
      }),
    ).toEqual({});
  });
});
