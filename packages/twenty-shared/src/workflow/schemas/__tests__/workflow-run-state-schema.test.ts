import { workflowRunStateSchema } from '../workflow-run-state-schema';

const STEP_ID = '5f0f7f3a-6d7e-4a0b-9a51-2d6c7c1e9b10';

const parseRunSteps = (orderBy: Record<string, unknown>) =>
  workflowRunStateSchema.shape.flow.shape.steps.safeParse([
    {
      id: STEP_ID,
      name: 'Find companies',
      type: 'FIND_RECORDS',
      valid: true,
      settings: {
        input: { objectName: 'company', orderBy },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    },
  ]);

describe('workflowRunStateSchema', () => {
  it('should load a past run whose find records step kept the GraphQL order', () => {
    const result = parseRunSteps({
      gqlOperationOrderBy: [{ name: 'AscNullsLast' }],
      recordSorts: [{ fieldMetadataId: 'field-id', direction: 'ASC' }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.[0]).toMatchObject({
      settings: {
        input: {
          orderBy: {
            recordSorts: [{ fieldMetadataId: 'field-id', direction: 'ASC' }],
          },
        },
      },
    });
    expect(result.data?.[0]).not.toHaveProperty(
      'settings.input.orderBy.gqlOperationOrderBy',
    );
  });

  it('should still refuse a past run whose find records sort is invalid', () => {
    expect(
      parseRunSteps({
        recordSorts: [{ fieldMetadataId: 'field-id', direction: 'SIDEWAYS' }],
      }).success,
    ).toBe(false);
  });
});
