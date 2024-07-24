import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { ViewModule } from 'src/modules/view/view.module';

@Module({
  imports: [MessagingModule, CalendarModule, ViewModule],
  providers: [],
  exports: [],
})
export class ModulesModule {}
