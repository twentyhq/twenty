import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';

type CalendarEventRecordingEvaluateCommandOptions = {
  workspaceId: string;
  calendarEventId: string;
};

@Command({
  name: 'calendar-event-recording:evaluate',
  description:
    'Evaluate the recording decision for a single calendar event and print the result, without changing call recordings',
})
export class CalendarEventRecordingEvaluateCommand extends CommandRunner {
  private readonly logger = new Logger(
    CalendarEventRecordingEvaluateCommand.name,
  );

  constructor(
    private readonly calendarEventRecordingDecisionService: CalendarEventRecordingDecisionService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options: CalendarEventRecordingEvaluateCommandOptions,
  ): Promise<void> {
    const { workspaceId, calendarEventId } = options;

    const decision =
      await this.calendarEventRecordingDecisionService.evaluateCalendarEvent({
        workspaceId,
        calendarEventId,
      });

    if (!decision.found) {
      this.logger.warn(
        `Calendar event ${calendarEventId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const recordingDecisionSummary =
      decision.eventIntent === 'ACTIVE'
        ? 'would request recording'
        : 'would not request recording';

    this.logger.log(
      [
        `Workspace: ${decision.workspaceId}`,
        `Calendar event: ${decision.calendarEventId}`,
        `Recording preference: ${decision.recordingPreference}`,
        `Real meeting key: ${decision.realMeetingKey}`,
        `Event intent: ${decision.eventIntent} (${decision.reason})`,
        `Decision: ${recordingDecisionSummary}`,
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
