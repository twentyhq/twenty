import { computeClassifyOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-classify-output-schema.util';

describe('computeClassifyOutputSchema', () => {
  it('describes each named question under its name', () => {
    const outputSchema = computeClassifyOutputSchema([
      {
        id: 'sentiment-question',
        name: 'sentiment',
        type: 'choice',
        instructions: '',
        criteria: [
          { id: 'positive-criterion', name: 'positive' },
          { id: 'negative-criterion', name: 'negative' },
        ],
      },
      {
        id: 'unnamed-question',
        name: '',
        type: 'boolean',
        instructions: '',
        criteria: [],
      },
    ]);

    expect(Object.keys(outputSchema.answers.value)).toEqual(['sentiment']);
    expect(outputSchema.answers.value.sentiment).toMatchObject({
      value: {
        choice: { value: 'positive' },
        probabilities: {
          value: { positive: { value: 0 }, negative: { value: 0 } },
        },
      },
    });
  });
});
