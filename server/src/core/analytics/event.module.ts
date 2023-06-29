import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventResolver } from './event.resolver';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [EventResolver, EventService],
  imports: [HttpModule],
})
export class EventModule {}
