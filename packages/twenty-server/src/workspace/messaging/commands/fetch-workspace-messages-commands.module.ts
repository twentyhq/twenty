import { Module } from '@nestjs/common';

import { FetchWorkspaceMessagesCommand } from 'src/workspace/messaging/commands/fetch-workspace-messages.command';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';
import { FetchWorkspaceMessagesModule } from 'src/workspace/messaging/services/fetch-workspace-messages.module';

@Module({
  imports: [MessagingModule, FetchWorkspaceMessagesModule],
  providers: [FetchWorkspaceMessagesCommand],
})
export class FetchWorkspaceMessagesCommandsModule {}
