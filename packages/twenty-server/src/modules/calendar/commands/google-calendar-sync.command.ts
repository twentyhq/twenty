import { Command, CommandRunner, Option } from 'nest-commander';

import { GoogleCalendarSyncService } from 'src/modules/calendar/services/google-calendar-sync.service';

interface GoogleCalendarSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:google-calendar-sync',
  description:
    'Start google calendar sync for all workspaceMembers in a workspace.',
})
export class GoogleCalendarSyncCommand extends CommandRunner {
  constructor(
    private readonly googleCalendarSyncService: GoogleCalendarSyncService,
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
    options: GoogleCalendarSyncOptions,
  ): Promise<void> {
    await this.googleCalendarSyncService.startWorkspaceGoogleCalendarSync(
      options.workspaceId,
    );

    return;
  }
}
