import { type CalendarEventChannelRole } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-channel-role.type';
import { buildCalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/utils/build-calendar-event-participant-save-operations.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

const CALENDAR_EVENT_ID = 'calendar-event-id';
const CHANNEL_HANDLE = 'owner@example.com';

const buildFetchedParticipant = (
  overrides: Partial<FetchedParticipantWithCalendarEventId> = {},
): FetchedParticipantWithCalendarEventId => ({
  calendarEventId: CALENDAR_EVENT_ID,
  handle: 'john@example.com',
  displayName: 'John Doe',
  responseStatus: 'ACCEPTED',
  isOrganizer: false,
  ...overrides,
});

const buildExistingParticipant = (
  overrides: Partial<CalendarEventParticipantWorkspaceEntity> = {},
): CalendarEventParticipantWorkspaceEntity =>
  ({
    id: 'existing-participant-id',
    calendarEventId: CALENDAR_EVENT_ID,
    handle: 'john@example.com',
    displayName: 'John Doe',
    responseStatus: 'ACCEPTED',
    isOrganizer: false,
    personId: 'person-id',
    workspaceMemberId: null,
    ...overrides,
  }) as CalendarEventParticipantWorkspaceEntity;

const buildOperations = ({
  fetchedParticipants,
  existingParticipants,
  channelRole = 'ONLY_CHANNEL',
}: {
  fetchedParticipants: FetchedParticipantWithCalendarEventId[];
  existingParticipants: CalendarEventParticipantWorkspaceEntity[];
  channelRole?: CalendarEventChannelRole;
}) =>
  buildCalendarEventParticipantSaveOperations({
    fetchedParticipants,
    existingParticipants,
    channelRoleByCalendarEventId: new Map([[CALENDAR_EVENT_ID, channelRole]]),
    channelHandles: [CHANNEL_HANDLE],
  });

describe('buildCalendarEventParticipantSaveOperations', () => {
  it('skips existing participants whose fields did not change', () => {
    const operations = buildOperations({
      fetchedParticipants: [buildFetchedParticipant()],
      existingParticipants: [buildExistingParticipant()],
    });

    expect(operations).toEqual({
      participantsToInsert: [],
      participantsToUpdate: [],
      participantIdsToDelete: [],
    });
  });

  it('treats a null persisted display name as equal to an empty fetched one', () => {
    const operations = buildOperations({
      fetchedParticipants: [buildFetchedParticipant({ displayName: '' })],
      existingParticipants: [buildExistingParticipant({ displayName: null })],
    });

    expect(operations.participantsToUpdate).toEqual([]);
  });

  it.each([
    ['displayName', { displayName: 'Johnny Doe' }],
    ['responseStatus', { responseStatus: 'DECLINED' }],
    ['isOrganizer', { isOrganizer: true }],
  ])('updates the participant when %s changed', (_, fetchedOverrides) => {
    const fetchedParticipant = buildFetchedParticipant(fetchedOverrides);

    const operations = buildOperations({
      fetchedParticipants: [fetchedParticipant],
      existingParticipants: [buildExistingParticipant()],
    });

    expect(operations.participantsToUpdate).toEqual([
      {
        criteria: 'existing-participant-id',
        partialEntity: fetchedParticipant,
      },
    ]);
    expect(operations.participantsToInsert).toEqual([]);
    expect(operations.participantIdsToDelete).toEqual([]);
  });

  it('inserts new participants and deletes missing ones when the event is only in this channel', () => {
    const newParticipant = buildFetchedParticipant({
      handle: 'jane@example.com',
    });

    const operations = buildOperations({
      fetchedParticipants: [newParticipant],
      existingParticipants: [buildExistingParticipant()],
    });

    expect(operations.participantsToInsert).toEqual([
      { ...newParticipant, id: expect.any(String) },
    ]);
    expect(operations.participantsToUpdate).toEqual([]);
    expect(operations.participantIdsToDelete).toEqual([
      'existing-participant-id',
    ]);
  });

  it.each<CalendarEventChannelRole>([
    'ORGANIZER_CHANNEL',
    'ATTENDEE_CHANNEL',
    'ATTENDEE_CHANNEL_WITH_ORGANIZER_SYNCING',
  ])(
    'never deletes the attendees a shared event lists elsewhere as %s',
    (channelRole) => {
      const operations = buildOperations({
        fetchedParticipants: [
          buildFetchedParticipant({ handle: 'jane@example.com' }),
        ],
        existingParticipants: [buildExistingParticipant()],
        channelRole,
      });

      expect(operations.participantsToInsert).toEqual([
        expect.objectContaining({ handle: 'jane@example.com' }),
      ]);
      expect(operations.participantIdsToDelete).toEqual([]);
    },
  );

  it.each<CalendarEventChannelRole>([
    'ATTENDEE_CHANNEL',
    'ATTENDEE_CHANNEL_WITH_ORGANIZER_SYNCING',
  ])(
    'lets an %s update only the answer of its own attendee, even back to no answer',
    (channelRole) => {
      const operations = buildOperations({
        fetchedParticipants: [
          buildFetchedParticipant({ responseStatus: 'DECLINED' }),
          buildFetchedParticipant({
            handle: CHANNEL_HANDLE,
            responseStatus: 'NEEDS_ACTION',
          }),
        ],
        existingParticipants: [
          buildExistingParticipant(),
          buildExistingParticipant({
            id: 'channel-owner-participant-id',
            handle: CHANNEL_HANDLE,
          }),
        ],
        channelRole,
      });

      expect(operations.participantsToUpdate).toEqual([
        {
          criteria: 'channel-owner-participant-id',
          partialEntity: expect.objectContaining({
            responseStatus: 'NEEDS_ACTION',
          }),
        },
      ]);
    },
  );
});
