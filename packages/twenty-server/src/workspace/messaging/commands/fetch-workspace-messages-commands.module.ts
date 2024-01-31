import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { GmailFullSyncCommand } from 'src/workspace/messaging/commands/gmail-full-sync.command';
import { GmailPartialSyncCommand } from 'src/workspace/messaging/commands/gmail-partial-sync.command';
import { ConnectedAccountModule } from 'src/workspace/messaging/connected-account/connected-account.module';

@Module({
  imports: [
    DataSourceModule,
    TypeORMModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    ConnectedAccountModule,
  ],
  providers: [GmailFullSyncCommand, GmailPartialSyncCommand],
})
export class FetchWorkspaceMessagesCommandsModule {}
