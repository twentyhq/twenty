import { randomUUID } from 'node:crypto';

import { type TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

describe('Application calendar participants (integration)', () => {
  const calendarEventId = randomUUID();
  const participantId = randomUUID();

  beforeAll(async () => {
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."calendarEvent" (id, title) VALUES ($1, 'Application participant test')`,
      [calendarEventId],
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."calendarEvent" WHERE id = $1`,
      [calendarEventId],
    );
  });

  beforeEach(async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'calendarEventParticipant',
        gqlFields: 'id',
        data: {
          id: participantId,
          calendarEventId,
          handle: 'Meeting app',
          displayName: 'Meeting app',
          isOrganizer: false,
          responseStatus: 'ACCEPTED',
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createCalendarEventParticipant).toEqual({
      id: participantId,
    });
  });

  afterEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."calendarEventParticipant" WHERE "calendarEventId" = $1`,
      [calendarEventId],
    );
  });

  it('stores bots as regular participants without person or workspace member links', async () => {
    expect(
      await findRecordNodesByFilter<CalendarEventParticipantWorkspaceEntity>(
        'calendarEventParticipant',
        'calendarEventParticipants',
        'id handle displayName personId workspaceMemberId',
        { id: { eq: participantId } },
      ),
    ).toEqual([
      {
        id: participantId,
        handle: 'Meeting app',
        displayName: 'Meeting app',
        personId: null,
        workspaceMemberId: null,
      },
    ]);
  });

  it('returns bot info through timeline participants', async () => {
    const [{ id: personId }] = await global.testDataSource.query(
      `SELECT id FROM "${SCHEMA}".person LIMIT 1`,
    );
    const [{ id: workspaceMemberId }] = await global.testDataSource.query(
      `SELECT id FROM "${SCHEMA}"."workspaceMember" LIMIT 1`,
    );
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."calendarEventParticipant" ("calendarEventId", "personId", handle) VALUES ($1, $2, 'human@example.com')`,
      [calendarEventId, personId],
    );
    const timelineService =
      getAppProviderByClassName<TimelineCalendarEventService>(
        'TimelineCalendarEventService',
      );
    const result = await timelineService.getCalendarEventsFromPersonIds({
      workspaceId: WORKSPACE_ID,
      currentWorkspaceMemberId: workspaceMemberId,
      personIds: [personId],
      page: 1,
      pageSize: 100,
    });
    const event = result.timelineCalendarEvents.find(
      ({ id }) => id === calendarEventId,
    );

    expect(event?.participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: participantId,
          displayName: 'Meeting app',
          handle: 'Meeting app',
        }),
      ]),
    );
    expect(event).not.toHaveProperty('callRecordings');
  });
});
