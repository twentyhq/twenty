import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { CreateCompaniesAndContactsModule } from 'src/workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { BlocklistModule } from 'src/workspace/calendar-and-messaging/repositories/blocklist/blocklist.module';
import { ConnectedAccountModule } from 'src/workspace/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { CalendarChannelEventAssociationModule } from 'src/workspace/calendar/repositories/calendar-channel-event-association/calendar-channel-event-assocation.module';
import { CalendarChannelModule } from 'src/workspace/calendar/repositories/calendar-channel/calendar-channel.module';
import { CalendarEventAttendeeModule } from 'src/workspace/calendar/repositories/calendar-event-attendee/calendar-event-attendee.module';
import { CalendarEventModule } from 'src/workspace/calendar/repositories/calendar-event/calendar-event.module';
import { CalendarEventCleanerModule } from 'src/workspace/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { GoogleCalendarFullSyncService } from 'src/workspace/calendar/services/google-calendar-full-sync.service';
import { GoogleCalendarClientProvider } from 'src/workspace/calendar/services/providers/google-calendar/google-calendar.provider';
import { CompanyModule } from 'src/workspace/messaging/repositories/company/company.module';
import { PersonModule } from 'src/workspace/repositories/person/person.module';
import { WorkspaceMemberModule } from 'src/workspace/repositories/workspace-member/workspace-member.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

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
    WorkspaceMemberModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    CompanyModule,
    PersonModule,
    BlocklistModule,
    CalendarEventCleanerModule,
  ],
  providers: [GoogleCalendarFullSyncService, GoogleCalendarClientProvider],
  exports: [GoogleCalendarFullSyncService],
})
export class CalendarModule {}
