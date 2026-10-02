import { buildCalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/utils/build-calendar-event-participant-save-operations.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

const CALENDAR_EVENT_ID = 'calendar-event-id';

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

describe('buildCalendarEventParticipantSaveOperations', () => {
  it('skips existing participants whose fields did not change', () => {
    const operations = buildCalendarEventParticipantSaveOperations({
      fetchedParticipants: [buildFetchedParticipant()],
      existingParticipants: [buildExistingParticipant()],
      shouldSkipUnchangedParticipants: true,
    });

    expect(operations).toEqual({
      participantsToInsert: [],
      participantsToUpdate: [],
      participantIdsToDelete: [],
    });
  });

  it('updates unchanged participants when skipping is disabled', () => {
    const operations = buildCalendarEventParticipantSaveOperations({
      fetchedParticipants: [buildFetchedParticipant()],
      existingParticipants: [buildExistingParticipant()],
      shouldSkipUnchangedParticipants: false,
    });

    expect(operations.participantsToUpdate).toEqual([
      {
        criteria: 'existing-participant-id',
        partialEntity: buildFetchedParticipant(),
      },
    ]);
  });

  it('treats a null persisted display name as equal to an empty fetched one', () => {
    const operations = buildCalendarEventParticipantSaveOperations({
      fetchedParticipants: [buildFetchedParticipant({ displayName: '' })],
      existingParticipants: [buildExistingParticipant({ displayName: null })],
      shouldSkipUnchangedParticipants: true,
    });

    expect(operations.participantsToUpdate).toEqual([]);
  });

  it.each([
    ['displayName', { displayName: 'Johnny Doe' }],
    ['responseStatus', { responseStatus: 'DECLINED' }],
    ['isOrganizer', { isOrganizer: true }],
  ])('updates the participant when %s changed', (_, fetchedOverrides) => {
    const fetchedParticipant = buildFetchedParticipant(fetchedOverrides);

    const operations = buildCalendarEventParticipantSaveOperations({
      fetchedParticipants: [fetchedParticipant],
      existingParticipants: [buildExistingParticipant()],
      shouldSkipUnchangedParticipants: true,
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

  it('inserts new participants and deletes missing ones', () => {
    const newParticipant = buildFetchedParticipant({
      handle: 'jane@example.com',
    });

    const operations = buildCalendarEventParticipantSaveOperations({
      fetchedParticipants: [newParticipant],
      existingParticipants: [buildExistingParticipant()],
      shouldSkipUnchangedParticipants: true,
    });

    expect(operations.participantsToInsert).toEqual([
      { ...newParticipant, id: expect.any(String) },
    ]);
    expect(operations.participantsToUpdate).toEqual([]);
    expect(operations.participantIdsToDelete).toEqual([
      'existing-participant-id',
    ]);
  });
});
