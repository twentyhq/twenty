import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';

@Module({
  imports: [MessagingModule, CalendarModule],
  providers: [],
  exports: [],
})
export class ModulesModule {}
