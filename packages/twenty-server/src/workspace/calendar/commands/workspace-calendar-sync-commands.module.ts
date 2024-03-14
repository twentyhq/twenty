import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { ConnectedAccountModule } from 'src/workspace/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { GoogleCalendarFullSyncCommand } from 'src/workspace/calendar/commands/google-calendar-full-sync.command';

@Module({
  imports: [
    DataSourceModule,
    TypeORMModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    ConnectedAccountModule,
  ],
  providers: [GoogleCalendarFullSyncCommand],
})
export class WorkspaceCalendarSyncCommandsModule {}
