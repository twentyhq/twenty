import { Module } from '@nestjs/common';

import { MessagingQueryHookModule } from 'src/workspace/messaging/query-hooks/messaging-query-hook.module';
import { WorkspaceQueryHookService } from 'src/workspace/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';

@Module({
  imports: [MessagingQueryHookModule],
  providers: [WorkspaceQueryHookService],
  exports: [WorkspaceQueryHookService],
})
export class WorkspaceQueryHookModule {}
