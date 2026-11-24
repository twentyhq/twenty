import { type ViewPresetFilter } from '@/types/ViewPresetFilter';

export type MemberInboxViewPresetFilter = `${
  | ViewPresetFilter.INBOX_OPEN
  | ViewPresetFilter.INBOX_SNOOZED
  | ViewPresetFilter.INBOX_DONE
  | ViewPresetFilter.INBOX_MENTIONS}`;
