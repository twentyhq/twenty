import { workflowRunWorkflowActionSettingsSchema } from '@/workflow/schemas/workflow-run-workflow-action-settings-schema';

const baseSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

describe('workflowRunWorkflowActionSettingsSchema', () => {
  it('accepts a valid RUN_WORKFLOW settings object', () => {
    const result = workflowRunWorkflowActionSettingsSchema.safeParse({
      ...baseSettings,
      input: {
        workflowId: '20202020-1111-4111-8111-111111111111',
        input: { foo: 'bar' },
      },
    });

    expect(result.success).toBe(true);
  });

  it('accepts an empty mapped input record', () => {
    const result = workflowRunWorkflowActionSettingsSchema.safeParse({
      ...baseSettings,
      input: {
        workflowId: '20202020-1111-4111-8111-111111111111',
        input: {},
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-UUID workflowId', () => {
    const result = workflowRunWorkflowActionSettingsSchema.safeParse({
      ...baseSettings,
      input: {
        workflowId: '',
        input: {},
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects a missing workflowId', () => {
    const result = workflowRunWorkflowActionSettingsSchema.safeParse({
      ...baseSettings,
      input: {
        input: {},
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects a missing input record', () => {
    const result = workflowRunWorkflowActionSettingsSchema.safeParse({
      ...baseSettings,
      input: {
        workflowId: '20202020-1111-4111-8111-111111111111',
      },
    });

    expect(result.success).toBe(false);
  });
});
