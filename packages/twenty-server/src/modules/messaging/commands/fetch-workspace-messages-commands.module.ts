import { Module } from '@nestjs/common';

import { GmailFullSyncCommand } from 'src/modules/messaging/commands/gmail-full-sync.command';
import { GmailPartialSyncCommand } from 'src/modules/messaging/commands/gmail-partial-sync.command';
import { StartFetchAllWorkspacesMessagesCronCommand } from 'src/modules/messaging/commands/start-fetch-all-workspaces-messages.cron.command';
import { StopFetchAllWorkspacesMessagesCronCommand } from 'src/modules/messaging/commands/stop-fetch-all-workspaces-messages.cron.command';

@Module({
  imports: [],
  providers: [
    GmailFullSyncCommand,
    GmailPartialSyncCommand,
    StartFetchAllWorkspacesMessagesCronCommand,
    StopFetchAllWorkspacesMessagesCronCommand,
  ],
})
export class FetchWorkspaceMessagesCommandsModule {}
