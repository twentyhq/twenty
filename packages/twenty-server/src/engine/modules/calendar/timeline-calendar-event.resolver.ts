import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => null)
export class TimelineCalendarEventResolver {}
