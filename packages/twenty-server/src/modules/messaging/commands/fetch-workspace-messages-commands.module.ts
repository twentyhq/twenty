import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/features/feature-flag/feature-flag.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine/api/metadata/data-source/data-source.module';
import { GmailFullSyncCommand } from 'src/modules/messaging/commands/gmail-full-sync.command';
import { GmailPartialSyncCommand } from 'src/modules/messaging/commands/gmail-partial-sync.command';
import { ConnectedAccountModule } from 'src/modules/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { StartFetchAllWorkspacesMessagesCronCommand } from 'src/modules/messaging/commands/start-fetch-all-workspaces-messages.cron.command';
import { StopFetchAllWorkspacesMessagesCronCommand } from 'src/modules/messaging/commands/stop-fetch-all-workspaces-messages.cron.command';

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
