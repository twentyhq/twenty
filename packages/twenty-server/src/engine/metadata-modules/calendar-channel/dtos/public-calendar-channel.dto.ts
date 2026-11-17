import { ObjectType, PickType } from '@nestjs/graphql';

import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';

@ObjectType('PublicCalendarChannel')
export class PublicCalendarChannelDTO extends PickType(CalendarChannelDTO, [
  'id',
  'handle',
  'visibility',
  'connectedAccountId',
] as const) {}
