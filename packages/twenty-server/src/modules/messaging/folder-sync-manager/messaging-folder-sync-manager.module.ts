import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessagingFolderSyncCronCommand } from 'src/modules/messaging/folder-sync-manager/crons/commands/messaging-folder-sync.cron.command';
import { MessagingFolderSyncCronJob } from 'src/modules/messaging/folder-sync-manager/crons/jobs/messaging-folder-sync.cron.job';
import { MessagingFolderSyncJob } from 'src/modules/messaging/folder-sync-manager/jobs/messaging-folder-sync.job';
import { SyncMessageFoldersService } from 'src/modules/messaging/folder-sync-manager/services/sync-message-folders.service';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingMicrosoftDriverModule } from 'src/modules/messaging/message-import-manager/drivers/microsoft/messaging-microsoft-driver.module';

@Module({
  imports: [
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    DataSourceModule,
    TypeOrmModule.forFeature([Workspace]),
    MessagingGmailDriverModule,
    MessagingMicrosoftDriverModule,
    MessagingIMAPDriverModule,
  ],
  providers: [
    SyncMessageFoldersService,
    MessagingFolderSyncJob,
    MessagingFolderSyncCronJob,
    MessagingFolderSyncCronCommand,
  ],
  exports: [SyncMessageFoldersService, MessagingFolderSyncCronCommand],
})
export class MessagingFolderSyncManagerModule {}
