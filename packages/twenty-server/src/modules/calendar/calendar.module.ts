import { Module } from '@nestjs/common';

import { CalendarChannelListener } from 'src/modules/calendar/listeners/calendar-channel.listener';

@Module({
  imports: [],
  providers: [CalendarChannelListener],
  exports: [],
})
export class CalendarModule {}
