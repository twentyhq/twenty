import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { CalendarEventRecordingPolicyService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-policy.service';

type CalendarEventRecordingCheckPolicyCommandOptions = {
  workspaceId: string;
  calendarEventId: string;
};

@Command({
  name: 'calendar-event-recording:check-policy',
  description:
    'Check the recording policy for a single calendar event and print the result, without changing call recordings',
})
export class CalendarEventRecordingCheckPolicyCommand extends CommandRunner {
  private readonly logger = new Logger(
    CalendarEventRecordingCheckPolicyCommand.name,
  );

  constructor(
    private readonly calendarEventRecordingPolicyService: CalendarEventRecordingPolicyService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options: CalendarEventRecordingCheckPolicyCommandOptions,
  ): Promise<void> {
    const { workspaceId, calendarEventId } = options;

    const policyResult =
      await this.calendarEventRecordingPolicyService.resolveCalendarEventPolicyResult(
        {
          workspaceId,
          calendarEventId,
        },
      );

    if (!policyResult.found) {
      this.logger.warn(
        `Calendar event ${calendarEventId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const recordingPolicyResultSummary = policyResult.shouldRecord
      ? 'would request recording'
      : 'would not request recording';

    this.logger.log(
      [
        `Workspace: ${policyResult.workspaceId}`,
        `Calendar event: ${policyResult.calendarEventId}`,
        `Recording preference: ${policyResult.recordingPreference}`,
        `Real meeting key: ${policyResult.realMeetingKey}`,
        `Should record: ${policyResult.shouldRecord} (${policyResult.reason})`,
        `Result: ${recordingPolicyResultSummary}`,
      ].join('\n'),
    );
  }

  @Option({
    flags: '-w, --workspace-id <workspace-id>',
    description: 'Workspace ID',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-c, --calendar-event-id <calendar-event-id>',
    description: 'Calendar Event ID',
    required: true,
  })
  parseCalendarEventId(value: string): string {
    return value;
  }
}
