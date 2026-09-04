import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  CalendarChannelVisibility,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { buildCalendarEventRecordSharesToInsert } from 'src/modules/calendar/common/utils/build-calendar-event-record-shares-to-insert.util';

const CALENDAR_CHANNEL_ID = 'calendar-channel-1';
const OWNER_WORKSPACE_MEMBER_ID = 'workspace-member-1';
const CALENDAR_EVENT_OBJECT_METADATA_ID = 'calendar-event-object';

const ownerRow = (recordId: string) => ({
  recordId,
  objectMetadataId: CALENDAR_EVENT_OBJECT_METADATA_ID,
  principalId: OWNER_WORKSPACE_MEMBER_ID,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.APPLICATION,
  sourceId: CALENDAR_CHANNEL_ID,
});

const everyoneRow = (recordId: string) => ({
  recordId,
  objectMetadataId: CALENDAR_EVENT_OBJECT_METADATA_ID,
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.APPLICATION,
  sourceId: CALENDAR_CHANNEL_ID,
});

describe('buildCalendarEventRecordSharesToInsert', () => {
  it.each([
    CalendarChannelVisibility.METADATA,
    CalendarChannelVisibility.SHARE_EVERYTHING,
  ])(
    'should give the owner FULL and everyone READ on each event once under %s visibility',
    (visibility) => {
      expect(
        buildCalendarEventRecordSharesToInsert({
          calendarChannel: {
            calendarChannelId: CALENDAR_CHANNEL_ID,
            visibility,
            ownerWorkspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
          },
          calendarEventIds: ['event-1', 'event-2', 'event-1'],
          calendarEventObjectMetadataId: CALENDAR_EVENT_OBJECT_METADATA_ID,
        }),
      ).toEqual([
        ownerRow('event-1'),
        everyoneRow('event-1'),
        ownerRow('event-2'),
        everyoneRow('event-2'),
      ]);
    },
  );

  it('should write no owner row when the owner has no workspace member', () => {
    expect(
      buildCalendarEventRecordSharesToInsert({
        calendarChannel: {
          calendarChannelId: CALENDAR_CHANNEL_ID,
          visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
          ownerWorkspaceMemberId: null,
        },
        calendarEventIds: ['event-1'],
        calendarEventObjectMetadataId: CALENDAR_EVENT_OBJECT_METADATA_ID,
      }),
    ).toEqual([everyoneRow('event-1')]);
  });

  it('should return an empty array without events', () => {
    expect(
      buildCalendarEventRecordSharesToInsert({
        calendarChannel: {
          calendarChannelId: CALENDAR_CHANNEL_ID,
          visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
          ownerWorkspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
        },
        calendarEventIds: [],
        calendarEventObjectMetadataId: CALENDAR_EVENT_OBJECT_METADATA_ID,
      }),
    ).toEqual([]);
  });
});
