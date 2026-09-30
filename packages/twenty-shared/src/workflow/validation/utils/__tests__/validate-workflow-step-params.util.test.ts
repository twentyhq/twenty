import { type ValidatableWorkflow } from '@/workflow/validation/types/WorkflowValidation';
import { validateWorkflowStepParams } from '../validate-workflow-step-params.util';

describe('validateWorkflowStepParams', () => {
  it('should return no issues when there is no trigger and no steps', () => {
    const workflow: ValidatableWorkflow = {
      trigger: undefined,
      steps: undefined,
    };

    expect(validateWorkflowStepParams(workflow)).toEqual([]);
  });

  it('should flag an invalid trigger configuration', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'NOT_A_REAL_TRIGGER' },
      steps: [],
    };

    const issues = validateWorkflowStepParams(workflow);

    expect(
      issues.some((issue) => issue.code === 'INVALID_TRIGGER_PARAMS'),
    ).toBe(true);
  });

  it('should flag an invalid step configuration with its step id', () => {
    const workflow: ValidatableWorkflow = {
      trigger: undefined,
      steps: [{ id: 'step-1', type: 'NOT_A_REAL_ACTION' }],
    };

    const issues = validateWorkflowStepParams(workflow);

    expect(
      issues.some(
        (issue) =>
          issue.code === 'INVALID_STEP_PARAMS' && issue.stepId === 'step-1',
      ),
    ).toBe(true);
  });

  describe('email step body', () => {
    const emailStepWithBody = (body: string) => ({
      id: '8d5a0b6c-3f1e-4e4a-9a3b-2f6d1c0e7a11',
      name: 'Send email',
      type: 'SEND_EMAIL',
      valid: true,
      settings: {
        input: { connectedAccountId: '', recipients: {}, body },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    });

    const bodyIssues = (body: string) =>
      validateWorkflowStepParams({
        trigger: undefined,
        steps: [emailStepWithBody(body)],
      });

    it('should accept an empty body and serialized email documents', () => {
      const content = [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
      ];

      expect(bodyIssues('')).toEqual([]);
      expect(bodyIssues(JSON.stringify({ type: 'doc', content }))).toEqual([]);
      expect(
        bodyIssues(
          JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content }),
        ),
      ).toEqual([]);
    });

    it('should reject HTML and plain text bodies', () => {
      for (const body of ['<p>Hi</p>', 'Hi {{trigger.name}},\n\nThanks']) {
        expect(bodyIssues(body)).toEqual([
          expect.objectContaining({
            code: 'INVALID_STEP_PARAMS',
            stepId: '8d5a0b6c-3f1e-4e4a-9a3b-2f6d1c0e7a11',
            message: expect.stringContaining(
              'must be a serialized email document',
            ),
          }),
        ]);
      }
    });
  });
});
