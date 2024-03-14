import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/features/feature-flag/feature-flag.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine/api/metadata/data-source/data-source.module';
import { ConnectedAccountModule } from 'src/modules/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { GoogleCalendarFullSyncCommand } from 'src/modules/calendar/commands/google-calendar-full-sync.command';

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
