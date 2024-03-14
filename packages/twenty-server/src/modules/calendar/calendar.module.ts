import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/features/feature-flag/feature-flag.entity';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { CreateCompaniesAndContactsModule } from 'src/modules/messaging/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { BlocklistModule } from 'src/modules/calendar-and-messaging/repositories/blocklist/blocklist.module';
import { ConnectedAccountModule } from 'src/modules/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { CalendarChannelEventAssociationModule } from 'src/modules/calendar/repositories/calendar-channel-event-association/calendar-channel-event-assocation.module';
import { CalendarChannelModule } from 'src/modules/calendar/repositories/calendar-channel/calendar-channel.module';
import { CalendarEventAttendeeModule } from 'src/modules/calendar/repositories/calendar-event-attendee/calendar-event-attendee.module';
import { CalendarEventModule } from 'src/modules/calendar/repositories/calendar-event/calendar-event.module';
import { CalendarEventCleanerModule } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { GoogleCalendarFullSyncService } from 'src/modules/calendar/services/google-calendar-full-sync.service';
import { GoogleCalendarClientProvider } from 'src/modules/calendar/services/providers/google-calendar/google-calendar.provider';
import { CompanyModule } from 'src/modules/messaging/repositories/company/company.module';
import { PersonModule } from 'src/modules/person/person.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace/datasource/workspace-datasource.module';

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
