import { CalendarChannelSyncStatus } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type CalendarEventChannelRole } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-channel-role.type';
import { type CalendarEventSharingChannel } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-channel.type';
import { getCalendarChannelHandles } from 'src/modules/calendar/calendar-event-import-manager/utils/get-calendar-channel-handles.util';

export const computeCalendarEventChannelRole = ({
  organizerHandle,
  channelHandles,
  otherChannelIds,
  calendarChannelById,
}: {
  organizerHandle: string;
  channelHandles: string[];
  otherChannelIds: string[];
  calendarChannelById: Map<string, CalendarEventSharingChannel>;
}): CalendarEventChannelRole => {
  if (otherChannelIds.length === 0) {
    return 'ONLY_CHANNEL';
  }

  if (channelHandles.includes(organizerHandle)) {
    return 'ORGANIZER_CHANNEL';
  }

  const isOrganizerChannelSyncing = otherChannelIds.some((otherChannelId) => {
    const otherChannel = calendarChannelById.get(otherChannelId);

    if (
      !isDefined(otherChannel) ||
      !otherChannel.isSyncEnabled ||
      !getCalendarChannelHandles({
        calendarChannel: otherChannel,
        connectedAccount: otherChannel.connectedAccount,
      }).includes(organizerHandle)
    ) {
      return false;
    }

    switch (otherChannel.syncStatus) {
      case CalendarChannelSyncStatus.ACTIVE:
      case CalendarChannelSyncStatus.ONGOING:
        return true;
      case CalendarChannelSyncStatus.NOT_SYNCED:
      case CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS:
      case CalendarChannelSyncStatus.FAILED_UNKNOWN:
        return false;
      default:
        return assertUnreachable(otherChannel.syncStatus);
    }
  });

  return isOrganizerChannelSyncing
    ? 'ATTENDEE_CHANNEL_WITH_ORGANIZER_SYNCING'
    : 'ATTENDEE_CHANNEL';
};
