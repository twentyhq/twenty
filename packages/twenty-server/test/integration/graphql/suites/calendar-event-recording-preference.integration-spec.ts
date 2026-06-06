import { randomUUID } from 'crypto';

import gql from 'graphql-tag';

import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CalendarEventRecordingDecisionService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-decision.service';
import { CalendarEventRecordingReconciliationService } from 'src/modules/calendar/calendar-event-recording-manager/services/calendar-event-recording-reconciliation.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const TEST_WORKSPACE_SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const FUTURE_START = '2999-01-01T10:00:00.000Z';
const FUTURE_END = '2999-01-01T11:00:00.000Z';
const CONFERENCE_LINK_URL = 'https://meet.google.com/call-rec-api-test';
const seededCalendarEventIds: string[] = [];
const seededCalendarEventParticipantIds: string[] = [];

const UPDATE_CALENDAR_EVENT_RECORDING_PREFERENCE = gql`
  mutation UpdateCalendarEventRecordingPreference(
    $input: UpdateCalendarEventRecordingPreferenceInput!
  ) {
    updateCalendarEventRecordingPreference(input: $input) {
      calendarEventId
      recordingPreference
    }
  }
`;

const CAN_UPDATE_CALENDAR_EVENT_RECORDING_PREFERENCE = gql`
  query CanUpdateCalendarEventRecordingPreference($calendarEventId: UUID!) {
    canUpdateCalendarEventRecordingPreference(calendarEventId: $calendarEventId)
  }
`;

type CallRecordingRow = {
  id: string;
  title: string;
  status: string;
  calendarEventId: string;
  startedAt: string;
  endedAt: string;
};

describe('calendar event recording preference lifecycle (e2e)', () => {
  let calendarEventRecordingDecisionService: CalendarEventRecordingDecisionService;
  let calendarEventRecordingReconciliationService: CalendarEventRecordingReconciliationService;

  beforeAll(async () => {
    const globalWorkspaceOrmManager = global.app.get(
      GlobalWorkspaceOrmManager,
      {
        strict: false,
      },
    );
    const featureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
    } as unknown as FeatureFlagService;

    calendarEventRecordingDecisionService =
      new CalendarEventRecordingDecisionService(
        globalWorkspaceOrmManager,
        featureFlagService,
      );
    calendarEventRecordingReconciliationService =
      new CalendarEventRecordingReconciliationService(
        globalWorkspaceOrmManager,
      );
  });

  afterEach(async () => {
    await cleanupSeededRows({
      calendarEventIds: seededCalendarEventIds,
      calendarEventParticipantIds: seededCalendarEventParticipantIds,
    });

    seededCalendarEventIds.length = 0;
    seededCalendarEventParticipantIds.length = 0;
  });
  it('updates preference for a participant and reconciles scheduled and canceled recordings', async () => {
    const calendarEventId = await seedCalendarEvent({
      title: 'Customer sync',
    });

    await seedCalendarEventParticipant({
      calendarEventId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    await seedCalendarEventParticipant({
      calendarEventId,
      workspaceMemberId: null,
      handle: 'external@example.com',
    });

    const canUpdateResponse = await makeGraphqlAPIRequest({
      query: CAN_UPDATE_CALENDAR_EVENT_RECORDING_PREFERENCE,
      variables: { calendarEventId },
    });

    expect(
      canUpdateResponse.body.data.canUpdateCalendarEventRecordingPreference,
    ).toBe(true);

    const updateOnResponse = await updateCalendarEventRecordingPreference({
      calendarEventId,
      recordingPreference: 'ON',
    });

    expect(updateOnResponse.body.errors).toBeUndefined();
    expect(
      updateOnResponse.body.data.updateCalendarEventRecordingPreference,
    ).toEqual({
      calendarEventId,
      recordingPreference: 'ON',
    });

    await reconcileCalendarEventRecording([calendarEventId]);

    expect(await findCallRecordingsByCalendarEventIds([calendarEventId])).toEqual(
      [
        expect.objectContaining({
          title: 'Customer sync',
          status: 'SCHEDULED',
          calendarEventId,
          startedAt: FUTURE_START,
          endedAt: FUTURE_END,
        }),
      ],
    );

    const updateOffResponse = await updateCalendarEventRecordingPreference({
      calendarEventId,
      recordingPreference: 'OFF',
    });

    expect(updateOffResponse.body.errors).toBeUndefined();

    await reconcileCalendarEventRecording([calendarEventId]);

    expect(await findCallRecordingsByCalendarEventIds([calendarEventId])).toEqual(
      [
        expect.objectContaining({
          status: 'CANCELED',
          calendarEventId,
        }),
      ],
    );
  });

  it('rejects preference updates from users who are not participants', async () => {
    const calendarEventId = await seedCalendarEvent({
      title: 'Private customer sync',
    });

    await seedCalendarEventParticipant({
      calendarEventId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    const canUpdateResponse = await makeGraphqlAPIRequest(
      {
        query: CAN_UPDATE_CALENDAR_EVENT_RECORDING_PREFERENCE,
        variables: { calendarEventId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(
      canUpdateResponse.body.data.canUpdateCalendarEventRecordingPreference,
    ).toBe(false);

    const updateResponse = await updateCalendarEventRecordingPreference(
      {
        calendarEventId,
        recordingPreference: 'ON',
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(updateResponse.body.errors?.[0]?.message).toBe(
      'You do not have permission to update this calendar event recording preference.',
    );
    expect(await findCalendarEventRecordingPreference(calendarEventId)).toBe(
      'AUTO',
    );
  });

  it('reconciles duplicate meeting rows into one scheduled recording when one copy is ON and one is OFF', async () => {
    const activeCalendarEventId = await seedCalendarEvent({
      title: 'Duplicated customer sync',
      iCalUid: 'duplicated-customer-sync@example.com',
    });
    const offCalendarEventId = await seedCalendarEvent({
      title: 'Duplicated customer sync',
      iCalUid: 'duplicated-customer-sync@example.com',
    });

    await seedCalendarEventParticipant({
      calendarEventId: activeCalendarEventId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
    await seedCalendarEventParticipant({
      calendarEventId: offCalendarEventId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    await updateCalendarEventRecordingPreference({
      calendarEventId: activeCalendarEventId,
      recordingPreference: 'ON',
    });
    await updateCalendarEventRecordingPreference({
      calendarEventId: offCalendarEventId,
      recordingPreference: 'OFF',
    });

    await reconcileCalendarEventRecording([
      activeCalendarEventId,
      offCalendarEventId,
    ]);

    expect(
      await findCallRecordingsByCalendarEventIds([
        activeCalendarEventId,
        offCalendarEventId,
      ]),
    ).toEqual([
      expect.objectContaining({
        status: 'SCHEDULED',
        calendarEventId: activeCalendarEventId,
      }),
    ]);
  });

  const updateCalendarEventRecordingPreference = (
    {
      calendarEventId,
      recordingPreference,
    }: {
      calendarEventId: string;
      recordingPreference: 'AUTO' | 'ON' | 'OFF';
    },
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) =>
    makeGraphqlAPIRequest(
      {
        query: UPDATE_CALENDAR_EVENT_RECORDING_PREFERENCE,
        variables: {
          input: {
            calendarEventId,
            recordingPreference,
          },
        },
      },
      token,
    );

  const reconcileCalendarEventRecording = async (
    changedCalendarEventIds: string[],
  ) => {
    const meetingDecisions =
      await calendarEventRecordingDecisionService.evaluateMeetingOccurrences({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        calendarEventIds: changedCalendarEventIds,
      });

    await calendarEventRecordingReconciliationService.reconcileMeetingOccurrences(
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        meetingDecisions,
      },
    );
  };
});

const seedCalendarEvent = async ({
  title,
  iCalUid = `${randomUUID()}@example.com`,
}: {
  title: string;
  iCalUid?: string;
}) => {
  const calendarEventId = randomUUID();

  await global.testDataSource.query(
    `
      INSERT INTO "${TEST_WORKSPACE_SCHEMA}"."calendarEvent" (
        id,
        title,
        "isCanceled",
        "isFullDay",
        "startsAt",
        "endsAt",
        "externalCreatedAt",
        "externalUpdatedAt",
        description,
        location,
        "iCalUid",
        "conferenceSolution",
        "conferenceLinkPrimaryLinkLabel",
        "conferenceLinkPrimaryLinkUrl",
        "recordingPreference"
      )
      VALUES ($1, $2, false, false, $3, $4, $3, $3, '', '', $5, 'Google Meet', 'Meet', $6, 'AUTO')
    `,
    [
      calendarEventId,
      title,
      FUTURE_START,
      FUTURE_END,
      iCalUid,
      CONFERENCE_LINK_URL,
    ],
  );

  return trackCalendarEventId(calendarEventId);
};

const seedCalendarEventParticipant = async ({
  calendarEventId,
  workspaceMemberId,
  handle = 'jane.austen@apple.dev',
}: {
  calendarEventId: string;
  workspaceMemberId: string | null;
  handle?: string;
}) => {
  const calendarEventParticipantId = randomUUID();

  await global.testDataSource.query(
    `
      INSERT INTO "${TEST_WORKSPACE_SCHEMA}"."calendarEventParticipant" (
        id,
        handle,
        "displayName",
        "isOrganizer",
        "responseStatus",
        "calendarEventId",
        "workspaceMemberId"
      )
      VALUES ($1, $2, $2, false, 'ACCEPTED', $3, $4)
    `,
    [calendarEventParticipantId, handle, calendarEventId, workspaceMemberId],
  );

  return trackCalendarEventParticipantId(calendarEventParticipantId);
};

const findCallRecordingsByCalendarEventIds = async (
  calendarEventIds: string[],
): Promise<CallRecordingRow[]> =>
  global.testDataSource.query(
    `
      SELECT
        id,
        title,
        status,
        "calendarEventId",
        "startedAt",
        "endedAt"
      FROM "${TEST_WORKSPACE_SCHEMA}"."callRecording"
      WHERE "calendarEventId" = ANY($1::uuid[])
      ORDER BY id
    `,
    [calendarEventIds],
  );

const findCalendarEventRecordingPreference = async (
  calendarEventId: string,
): Promise<string> => {
  const [calendarEvent] = await global.testDataSource.query(
    `
      SELECT "recordingPreference"
      FROM "${TEST_WORKSPACE_SCHEMA}"."calendarEvent"
      WHERE id = $1
    `,
    [calendarEventId],
  );

  return calendarEvent.recordingPreference;
};

const cleanupSeededRows = async ({
  calendarEventIds,
  calendarEventParticipantIds,
}: {
  calendarEventIds: string[];
  calendarEventParticipantIds: string[];
}) => {
  await deleteByColumn({
    tableName: 'callRecording',
    columnName: 'calendarEventId',
    ids: calendarEventIds,
  });
  await deleteByColumn({
    tableName: 'calendarEventParticipant',
    columnName: 'id',
    ids: calendarEventParticipantIds,
  });
  await deleteByColumn({
    tableName: 'calendarEvent',
    columnName: 'id',
    ids: calendarEventIds,
  });
};

const deleteByColumn = async ({
  tableName,
  columnName,
  ids,
}: {
  tableName: string;
  columnName: string;
  ids: string[];
}) => {
  if (ids.length === 0) {
    return;
  }

  await global.testDataSource.query(
    `DELETE FROM "${TEST_WORKSPACE_SCHEMA}"."${tableName}" WHERE "${columnName}" = ANY($1::uuid[])`,
    [ids],
  );
};

const trackCalendarEventId = (calendarEventId: string) => {
  seededCalendarEventIds.push(calendarEventId);

  return calendarEventId;
};
const trackCalendarEventParticipantId = (
  calendarEventParticipantId: string,
) => {
  seededCalendarEventParticipantIds.push(calendarEventParticipantId);

  return calendarEventParticipantId;
};
