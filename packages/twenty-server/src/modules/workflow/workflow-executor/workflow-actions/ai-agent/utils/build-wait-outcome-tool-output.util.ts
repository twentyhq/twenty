import { type WorkflowWaitOutcome } from 'src/modules/workflow/workflow-wait/types/workflow-wait-outcome.type';

export const buildWaitOutcomeToolOutput = (
  outcome: WorkflowWaitOutcome,
): Record<string, unknown> => {
  switch (outcome.type) {
    case 'TIME_ELAPSED':
      return {
        success: true,
        message: 'The wait is over.',
        result: { status: 'completed' },
      };
    // the agent reads the record with its own tools, so its permissions decide what it sees
    case 'EVENT_RECEIVED': {
      const { eventName, recordId, updatedFields } = outcome.event;

      return {
        success: true,
        message: `${eventName} happened on record ${recordId}.`,
        result: {
          status: 'completed',
          event: { eventName, recordId, updatedFields },
        },
      };
    }
    case 'EXPIRED':
      return {
        success: true,
        message:
          'Stopped waiting: the event did not happen before the timeout.',
        result: { status: 'expired' },
      };
  }
};
