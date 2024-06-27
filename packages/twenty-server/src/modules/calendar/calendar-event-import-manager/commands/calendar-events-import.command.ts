import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkspaceGoogleCalendarSyncService } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.service';

interface CalendarEventsImportOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:google-calendar-sync',
  description:
    'Start google calendar sync for all workspaceMembers in a workspace.',
})
export class CalendarEventsImportCommand extends CommandRunner {
  constructor(
    private readonly workspaceGoogleCalendarSyncService: WorkspaceGoogleCalendarSyncService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: CalendarEventsImportOptions,
  ): Promise<void> {
    await this.workspaceGoogleCalendarSyncService.startWorkspaceGoogleCalendarSync(
      options.workspaceId,
    );

    return;
  }
}
