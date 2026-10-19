import { isNonEmptyString } from '@sniptt/guards';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const getCalendarChannelHandles = ({
  calendarChannel,
  connectedAccount,
}: {
  calendarChannel: Pick<CalendarChannelEntity, 'handle'>;
  connectedAccount: Pick<ConnectedAccountEntity, 'handleAliases'>;
}): string[] =>
  [calendarChannel.handle, ...(connectedAccount.handleAliases ?? [])]
    .filter(isNonEmptyString)
    .map((handle) => handle.toLowerCase());
