import { type CalendarChannelVisibility } from 'twenty-shared/types';

export type CalendarChannelRecordShareSource = {
  calendarChannelId: string;
  visibility: CalendarChannelVisibility;
  ownerWorkspaceMemberId: string | null;
};
