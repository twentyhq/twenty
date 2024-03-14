import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { PersonModule } from 'src/modules/person/person.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';

@Module({
  providers: [
    CalendarModule,
    MessagingModule,
    PersonModule,
    WorkspaceMemberModule,
  ],
})
export class BusinessModule {}
