import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type ConnectedAccountForWorkflowStepResolution = Pick<
  ConnectedAccountEntity,
  | 'id'
  | 'handle'
  | 'provider'
  | 'connectionParameters'
  | 'archivedAt'
  | 'scopes'
  | 'scope'
> & { calendarChannels: Pick<CalendarChannelEntity, 'isSyncEnabled'>[] };
