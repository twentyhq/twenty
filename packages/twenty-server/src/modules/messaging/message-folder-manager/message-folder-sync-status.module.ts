import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageFolderSyncStatusResolver } from 'src/modules/messaging/message-folder-manager/message-folder-sync-status.resolver';
import { MessageFolderSyncStatusService } from 'src/modules/messaging/message-folder-manager/services/message-folder-sync-status.service';

@Module({
  imports: [PermissionsModule, WorkspaceDataSourceModule],
  providers: [MessageFolderSyncStatusResolver, MessageFolderSyncStatusService],
  exports: [MessageFolderSyncStatusService],
})
export class MessageFolderSyncStatusModule {}
