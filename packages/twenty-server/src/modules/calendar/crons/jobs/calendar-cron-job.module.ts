import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { GoogleCalendarSyncCronJob } from 'src/modules/calendar/crons/jobs/google-calendar-sync.cron.job';
import { WorkspaceGoogleCalendarSyncModule } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
    WorkspaceGoogleCalendarSyncModule,
  ],
  providers: [
    {
      provide: GoogleCalendarSyncCronJob.name,
      useClass: GoogleCalendarSyncCronJob,
    },
  ],
})
export class CalendarCronJobModule {}
