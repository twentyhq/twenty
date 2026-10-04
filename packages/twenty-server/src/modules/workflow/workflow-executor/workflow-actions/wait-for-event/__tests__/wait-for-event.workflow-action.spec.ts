import { WorkflowActionType } from 'twenty-shared/workflow';

import { WaitForEventWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/wait-for-event.workflow-action';

const NOW = new Date('2026-10-04T10:00:00.000Z');

const executeWithInput = (input: Record<string, unknown>) =>
  new WaitForEventWorkflowAction().execute({
    currentStepId: 'step-id',
    steps: [
      {
        id: 'step-id',
        name: 'Wait for Event',
        type: WorkflowActionType.WAIT_FOR_EVENT,
        valid: true,
        settings: {
          input,
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
      },
    ] as never,
    context: { trigger: { object: { id: 'company-id' } } },
    runInfo: { workflowRunId: 'run-id', workspaceId: 'workspace-id' },
  });

describe('WaitForEventWorkflowAction', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('waits on the event for the record its variable resolves to', async () => {
    await expect(
      executeWithInput({
        eventName: 'company.updated',
        recordId: '{{trigger.object.id}}',
        updatedFields: ['stage'],
      }),
    ).resolves.toEqual({
      wait: {
        type: 'EVENT',
        eventName: 'company.updated',
        recordId: 'company-id',
        updatedFields: ['stage'],
      },
    });
  });

  it('expires the wait after its timeout', async () => {
    await expect(
      executeWithInput({
        eventName: 'task.created',
        timeout: { days: 1, hours: '2', minutes: '' },
      }),
    ).resolves.toEqual({
      wait: {
        type: 'EVENT',
        eventName: 'task.created',
        expiresAt: '2026-10-05T12:00:00.000Z',
      },
    });
  });

  it('refuses an event it could never match', async () => {
    await expect(executeWithInput({ eventName: 'company' })).rejects.toThrow(
      'Invalid event to wait for',
    );
  });
});
