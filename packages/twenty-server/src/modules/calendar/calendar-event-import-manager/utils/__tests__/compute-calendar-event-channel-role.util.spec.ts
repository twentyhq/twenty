import { CalendarChannelSyncStatus } from 'twenty-shared/types';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { computeCalendarEventChannelRole } from 'src/modules/calendar/calendar-event-import-manager/utils/compute-calendar-event-channel-role.util';

const ORGANIZER_HANDLE = 'organizer@company.com';

const buildCalendarChannel = ({
  id,
  handle = 'guest@company.com',
  handleAliases = [],
  syncStatus = CalendarChannelSyncStatus.ACTIVE,
  isSyncEnabled = true,
}: {
  id: string;
  handle?: string;
  handleAliases?: string[] | null;
  syncStatus?: CalendarChannelSyncStatus;
  isSyncEnabled?: boolean;
}) =>
  ({
    id,
    handle,
    syncStatus,
    isSyncEnabled,
    connectedAccount: { handleAliases },
  }) as CalendarChannelEntity;

const computeRole = ({
  organizerHandle = ORGANIZER_HANDLE,
  channelHandles = ['guest@company.com'],
  otherChannels,
}: {
  organizerHandle?: string;
  channelHandles?: string[];
  otherChannels: CalendarChannelEntity[];
}) =>
  computeCalendarEventChannelRole({
    organizerHandle,
    channelHandles,
    otherChannelIds: otherChannels.map(({ id }) => id),
    calendarChannelById: new Map(
      otherChannels.map((otherChannel) => [otherChannel.id, otherChannel]),
    ),
  });

describe('computeCalendarEventChannelRole', () => {
  it('returns ONLY_CHANNEL when no other channel holds the event, even if someone else organized it', () => {
    expect(computeRole({ otherChannels: [] })).toBe('ONLY_CHANNEL');
  });

  it('returns ORGANIZER_CHANNEL when this channel belongs to the organizer', () => {
    expect(
      computeRole({
        channelHandles: [ORGANIZER_HANDLE],
        otherChannels: [buildCalendarChannel({ id: 'guest-channel-id' })],
      }),
    ).toBe('ORGANIZER_CHANNEL');
  });

  it('recognizes the organizer channel of the event through a handle alias, whatever its case', () => {
    expect(
      computeRole({
        otherChannels: [
          buildCalendarChannel({
            id: 'organizer-channel-id',
            handle: 'primary@company.com',
            handleAliases: ['Organizer@Company.com'],
            syncStatus: CalendarChannelSyncStatus.ONGOING,
          }),
        ],
      }),
    ).toBe('ATTENDEE_CHANNEL_WITH_ORGANIZER_SYNCING');
  });

  it.each([
    { syncStatus: CalendarChannelSyncStatus.NOT_SYNCED, isSyncEnabled: true },
    {
      syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      isSyncEnabled: true,
    },
    {
      syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
      isSyncEnabled: true,
    },
    { syncStatus: CalendarChannelSyncStatus.ACTIVE, isSyncEnabled: false },
  ])(
    'returns ATTENDEE_CHANNEL when the organizer channel is $syncStatus with sync enabled $isSyncEnabled',
    ({ syncStatus, isSyncEnabled }) => {
      expect(
        computeRole({
          otherChannels: [
            buildCalendarChannel({
              id: 'organizer-channel-id',
              handle: ORGANIZER_HANDLE,
              syncStatus,
              isSyncEnabled,
            }),
          ],
        }),
      ).toBe('ATTENDEE_CHANNEL');
    },
  );

  it('never matches an unknown organizer to a channel without a handle', () => {
    expect(
      computeRole({
        organizerHandle: '',
        otherChannels: [
          buildCalendarChannel({
            id: 'other-channel-id',
            handle: '',
            handleAliases: null,
          }),
        ],
      }),
    ).toBe('ATTENDEE_CHANNEL');
  });

  it('still treats the event as shared when another channel is not known yet', () => {
    expect(
      computeCalendarEventChannelRole({
        organizerHandle: ORGANIZER_HANDLE,
        channelHandles: ['guest@company.com'],
        otherChannelIds: ['channel-created-after-the-read'],
        calendarChannelById: new Map(),
      }),
    ).toBe('ATTENDEE_CHANNEL');
  });
});
