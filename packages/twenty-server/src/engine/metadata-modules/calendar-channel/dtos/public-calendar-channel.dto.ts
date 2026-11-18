import { Field, ObjectType, PickType } from '@nestjs/graphql';

import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';

@ObjectType('PublicCalendarChannel')
export class PublicCalendarChannelDTO extends PickType(CalendarChannelDTO, [
  'id',
  'handle',
  'visibility',
  'connectedAccountId',
] as const) {
  @Field(() => ConnectedAccountPublicDTO, { nullable: true })
  connectedAccount: ConnectedAccountPublicDTO | null;
}
