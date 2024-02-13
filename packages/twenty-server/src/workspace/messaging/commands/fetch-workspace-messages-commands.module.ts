import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { GmailFullSyncCommand } from 'src/workspace/messaging/commands/gmail-full-sync.command';
import { GmailPartialSyncCommand } from 'src/workspace/messaging/commands/gmail-partial-sync.command';
import { ConnectedAccountModule } from 'src/workspace/messaging/repositories/connected-account/connected-account.module';
import { StartFetchAllWorkspacesMessagesCronCommand } from 'src/workspace/messaging/commands/start-fetch-all-workspaces-messages.cron.command';
import { StopFetchAllWorkspacesMessagesCronCommand } from 'src/workspace/messaging/commands/stop-fetch-all-workspaces-messages.cron.command';

@Module({
  imports: [
    DataSourceModule,
    TypeORMModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    ConnectedAccountModule,
  ],
  providers: [
    GmailFullSyncCommand,
    GmailPartialSyncCommand,
    StartFetchAllWorkspacesMessagesCronCommand,
    StopFetchAllWorkspacesMessagesCronCommand,
  ],
})
export class FetchWorkspaceMessagesCommandsModule {}
