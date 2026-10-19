import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type CalendarEventSharingChannel = Pick<
  CalendarChannelEntity,
  'id' | 'handle' | 'isSyncEnabled' | 'syncStatus'
> & {
  connectedAccount: Pick<ConnectedAccountEntity, 'handleAliases'>;
};
