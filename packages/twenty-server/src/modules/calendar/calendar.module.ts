import { Module } from '@nestjs/common';

import { CalendarBlocklistListener } from 'src/modules/calendar/listeners/calendar-blocklist.listener';
import { CalendarChannelListener } from 'src/modules/calendar/listeners/calendar-channel.listener';

@Module({
  imports: [],
  providers: [CalendarChannelListener, CalendarBlocklistListener],
  exports: [],
})
export class CalendarModule {}
