import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkspaceGoogleCalendarSyncService } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.service';

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
    options: GoogleCalendarSyncOptions,
  ): Promise<void> {
    await this.workspaceGoogleCalendarSyncService.startWorkspaceGoogleCalendarSync(
      options.workspaceId,
    );

    return;
  }
}
