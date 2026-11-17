import { type CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

export const fromCalendarChannelEntityToCalendarChannelDto = (
  calendarChannel: CalendarChannelEntity,
): CalendarChannelDTO => ({
  id: calendarChannel.id,
  handle: calendarChannel.handle,
  syncStatus: calendarChannel.syncStatus,
  syncStage: calendarChannel.syncStage,
  visibility: calendarChannel.visibility,
  isContactAutoCreationEnabled: calendarChannel.isContactAutoCreationEnabled,
  contactAutoCreationPolicy: calendarChannel.contactAutoCreationPolicy,
  excludePrivateEvents: calendarChannel.excludePrivateEvents,
  isSyncEnabled: calendarChannel.isSyncEnabled,
  syncCursor: calendarChannel.syncCursor,
  syncedAt: calendarChannel.syncedAt,
  syncStageStartedAt: calendarChannel.syncStageStartedAt,
  throttleFailureCount: calendarChannel.throttleFailureCount,
  connectedAccountId: calendarChannel.connectedAccountId,
  userWorkspaceId: calendarChannel.connectedAccount.userWorkspaceId,
  workspaceId: calendarChannel.workspaceId,
  createdAt: calendarChannel.createdAt,
  updatedAt: calendarChannel.updatedAt,
});
