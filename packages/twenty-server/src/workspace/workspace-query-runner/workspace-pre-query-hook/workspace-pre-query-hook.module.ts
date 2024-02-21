import { Module } from '@nestjs/common';

import { MessagingQueryHookModule } from 'src/workspace/messaging/query-hooks/messaging-query-hook.module';
import { WorkspacePreQueryHookService } from 'src/workspace/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.service';

@Module({
  imports: [MessagingQueryHookModule],
  providers: [WorkspacePreQueryHookService],
  exports: [WorkspacePreQueryHookService],
})
export class WorkspacePreQueryHookModule {}
