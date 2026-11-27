import { type ViewPresetFilter } from '@/types/ViewPresetFilter';

export type ChannelInboxViewPresetFilter = `${
  | ViewPresetFilter.INBOX_CHANNEL_OPEN
  | ViewPresetFilter.INBOX_CHANNEL_SNOOZED
  | ViewPresetFilter.INBOX_CHANNEL_DONE}`;
