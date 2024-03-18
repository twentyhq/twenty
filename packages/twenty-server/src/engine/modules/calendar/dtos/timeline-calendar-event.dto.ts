import { ObjectType, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEvent {
  @IDField(() => ID)
  id: string;
}
