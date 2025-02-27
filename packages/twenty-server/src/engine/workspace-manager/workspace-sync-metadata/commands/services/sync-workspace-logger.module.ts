import { Module } from '@nestjs/common';

import { SyncWorkspaceLoggerService } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.service';

@Module({
  providers: [SyncWorkspaceLoggerService],
  exports: [SyncWorkspaceLoggerService],
})
export class SyncWorkspaceLoggerModule {}
