import { Module } from '@nestjs/common';

import { GoogleCalendarSyncCommand } from 'src/modules/calendar/commands/google-calendar-sync.command';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { GoogleCalendarSyncCronCommand } from 'src/modules/calendar/crons/commands/google-calendar-sync.cron.command';

@Module({
  providers: [GoogleCalendarSyncCronCommand],
})
export class CalendarCronCommandsModule {}
