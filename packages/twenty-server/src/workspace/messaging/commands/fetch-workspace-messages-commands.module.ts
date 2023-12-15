import { Module } from '@nestjs/common';

import { FetchWorkspaceMessagesCommand } from 'src/workspace/messaging/commands/fetch-workspace-messages.command';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  providers: [FetchWorkspaceMessagesCommand],
})
export class FetchWorkspaceMessagesCommandsModule {}
