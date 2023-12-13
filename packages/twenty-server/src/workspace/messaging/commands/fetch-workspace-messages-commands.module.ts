import { Module } from '@nestjs/common';

import { FetchWorkspaceMessagesCommand } from 'src/workspace/messaging/commands/fetch-workspace-messages.command';
import { FetchWorkspaceMessagesModule } from 'src/workspace/messaging/services/fetch-workspace-messages.module';

@Module({
  imports: [FetchWorkspaceMessagesModule],
  providers: [FetchWorkspaceMessagesCommand],
})
export class FetchWorkspaceMessagesCommandsModule {}
