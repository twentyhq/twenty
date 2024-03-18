import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { TimelineCalendarEventsWithTotal } from 'src/engine/modules/calendar/dtos/timeline-calendar-events-with-total.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => TimelineCalendarEventsWithTotal)
export class TimelineCalendarEventResolver {}
