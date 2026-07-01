import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowCreateCalendarEventActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-calendar-event/types/workflow-create-calendar-event-action-input.type';

export const buildCreateCalendarEventStepLog = ({
  input,
  output,
  durationMs,
}: {
  input: WorkflowCreateCalendarEventActionInput;
  output: ToolOutput;
  durationMs: number;
}): WorkflowRunStepLog => {
  const result = (output.result ?? {}) as Record<string, unknown>;

  const extractString = (key: string): string | undefined =>
    typeof result[key] === 'string' ? result[key] : undefined;

  const extractNumber = (key: string): number | undefined =>
    typeof result[key] === 'number' ? result[key] : undefined;

  return {
    details: {
      type: 'CREATE_CALENDAR_EVENT',
      status: output.success ? 'SUCCESS' : 'ERROR',
      title: extractString('title') ?? input.title,
      startsAt: extractString('startsAt') ?? input.startsAt,
      endsAt: extractString('endsAt') ?? input.endsAt,
      attendeeCount: extractNumber('attendeeCount'),
      conferenceLink: extractString('conferenceLink'),
      connectedAccountId:
        extractString('connectedAccountId') ?? input.connectedAccountId,
      iCalUid: extractString('iCalUid'),
      error: output.error,
      durationMs,
    },
    entries: [],
    sizeBytes: 0,
  };
};
