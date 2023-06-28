import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventResolver } from './event.resolver';

@Module({
  providers: [EventResolver, EventService],
})
export class EventModule {}
