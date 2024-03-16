import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { CreateCompaniesAndContactsModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { BlocklistModule } from 'src/modules/connected-account/repositories/blocklist/blocklist.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/repositories/connected-account/connected-account.module';
import { CalendarChannelEventAssociationModule } from 'src/modules/calendar/repositories/calendar-channel-event-association/calendar-channel-event-assocation.module';
import { CalendarChannelModule } from 'src/modules/calendar/repositories/calendar-channel/calendar-channel.module';
import { CalendarEventAttendeeModule } from 'src/modules/calendar/repositories/calendar-event-attendee/calendar-event-attendee.module';
import { CalendarEventModule } from 'src/modules/calendar/repositories/calendar-event/calendar-event.module';
import { CalendarEventCleanerModule } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { GoogleCalendarFullSyncService } from 'src/modules/calendar/services/google-calendar-full-sync.service';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/services/providers/google-calendar/google-calendar.provider';
import { CompanyModule } from 'src/modules/company/repositories/company/company.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository.module';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Module({
  imports: [
    EnvironmentModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
    CalendarChannelModule,
    CalendarChannelEventAssociationModule,
    CalendarEventModule,
    CalendarEventAttendeeModule,
    CreateCompaniesAndContactsModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    CompanyModule,
    ObjectMetadataRepositoryModule.forFeature([
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
    BlocklistModule,
    CalendarEventCleanerModule,
  ],
  providers: [GoogleCalendarFullSyncService, GoogleCalendarClientProvider],
  exports: [GoogleCalendarFullSyncService],
})
export class CalendarModule {}
