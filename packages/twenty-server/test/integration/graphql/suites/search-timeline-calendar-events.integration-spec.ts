import gql from 'graphql-tag';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { isDefined } from 'twenty-shared/utils';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';

const SEARCH_TIMELINE_CALENDAR_EVENTS = gql`
  query SearchTimelineCalendarEvents(
    $objectNameSingular: String!
    $recordId: UUID!
    $searchInput: String
  ) {
    searchTimelineCalendarEvents(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      searchInput: $searchInput
    ) {
      recordTimelineCalendarEvents {
        id
      }
      otherTimelineCalendarEvents {
        id
      }
    }
  }
`;

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const COMPANY_ID = '20202020-ca1e-4000-8000-000000000001';
const SHARED_COMPANY_EVENT_ID = '20202020-ca1e-4000-8000-000000000002';
const HIDDEN_COMPANY_EVENT_ID = '20202020-ca1e-4000-8000-000000000003';
const OWN_EVENT_ID = '20202020-ca1e-4000-8000-000000000004';
const COLLEAGUE_EVENT_ID = '20202020-ca1e-4000-8000-000000000005';

const CALENDAR_EVENTS = [
  {
    calendarEventId: SHARED_COMPANY_EVENT_ID,
    associationId: '20202020-ca1e-4000-8000-000000000012',
    targetId: '20202020-ca1e-4000-8000-000000000022',
    title: 'Larkspur renewal review',
    calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
  },
  {
    calendarEventId: HIDDEN_COMPANY_EVENT_ID,
    associationId: '20202020-ca1e-4000-8000-000000000013',
    targetId: '20202020-ca1e-4000-8000-000000000023',
    title: 'Larkspur pricing on a private calendar',
    calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
  },
  {
    calendarEventId: OWN_EVENT_ID,
    associationId: '20202020-ca1e-4000-8000-000000000014',
    targetId: null,
    title: 'Larkspur kickoff',
    calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
  },
  {
    calendarEventId: COLLEAGUE_EVENT_ID,
    associationId: '20202020-ca1e-4000-8000-000000000015',
    targetId: null,
    title: 'Larkspur offsite planning',
    calendarChannelId: CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
  },
];

const createRecord = async ({
  objectMetadataSingularName,
  input,
}: {
  objectMetadataSingularName: string;
  input: object;
}) => {
  const { errors } = await createOneOperation({
    objectMetadataSingularName,
    input,
  });

  expect(errors).toBeUndefined();
};

const destroyRecord = (objectMetadataSingularName: string, recordId: string) =>
  makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

const searchTimelineCalendarEvents = async (searchInput?: string) => {
  const response = await makeGraphqlApiRequest({
    query: SEARCH_TIMELINE_CALENDAR_EVENTS,
    variables: {
      objectNameSingular: 'company',
      recordId: COMPANY_ID,
      searchInput,
    },
  });

  expect(response.body.errors).toBeUndefined();

  const { recordTimelineCalendarEvents, otherTimelineCalendarEvents } =
    response.body.data.searchTimelineCalendarEvents;

  return {
    recordCalendarEventIds: recordTimelineCalendarEvents.map(
      ({ id }: { id: string }) => id,
    ),
    otherCalendarEventIds: otherTimelineCalendarEvents.map(
      ({ id }: { id: string }) => id,
    ),
  };
};

describe('searchTimelineCalendarEvents (integration)', () => {
  beforeAll(async () => {
    await createRecord({
      objectMetadataSingularName: 'company',
      input: {
        id: COMPANY_ID,
        name: 'Larkspur Search Company',
      },
    });

    for (const calendarEvent of CALENDAR_EVENTS) {
      await createRecord({
        objectMetadataSingularName: 'calendarEvent',
        input: {
          id: calendarEvent.calendarEventId,
          title: calendarEvent.title,
          isFullDay: false,
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 60_000).toISOString(),
        },
      });

      // Channel associations are not writable through the API
      await global.testDataSource.query(
        `INSERT INTO "${TEST_SCHEMA_NAME}"."calendarChannelEventAssociation" ("id", "calendarEventId", "calendarChannelId", "eventExternalId") VALUES ($1, $2, $3, $4)`,
        [
          calendarEvent.associationId,
          calendarEvent.calendarEventId,
          calendarEvent.calendarChannelId,
          `larkspur-${calendarEvent.calendarEventId}`,
        ],
      );

      if (isDefined(calendarEvent.targetId)) {
        await createRecord({
          objectMetadataSingularName: 'calendarEventTarget',
          input: {
            id: calendarEvent.targetId,
            calendarEventId: calendarEvent.calendarEventId,
            targetCompanyId: COMPANY_ID,
          },
        });
      }
    }
  });

  afterAll(async () => {
    for (const calendarEvent of CALENDAR_EVENTS) {
      if (isDefined(calendarEvent.targetId)) {
        await destroyRecord('calendarEventTarget', calendarEvent.targetId);
      }

      await deleteRecordsByIds('calendarChannelEventAssociation', [
        calendarEvent.associationId,
      ]);
      await destroyRecord('calendarEvent', calendarEvent.calendarEventId);
    }

    await destroyRecord('company', COMPANY_ID);
  });

  it('should list the record events without fallback when there is no search input', async () => {
    const { recordCalendarEventIds, otherCalendarEventIds } =
      await searchTimelineCalendarEvents();

    expect(recordCalendarEventIds).toEqual(
      expect.arrayContaining([
        SHARED_COMPANY_EVENT_ID,
        HIDDEN_COMPANY_EVENT_ID,
      ]),
    );
    expect(otherCalendarEventIds).toEqual([]);
  });

  it('should return matching record events first and the viewer own matching events as fallback', async () => {
    const { recordCalendarEventIds, otherCalendarEventIds } =
      await searchTimelineCalendarEvents('larkspur');

    expect(recordCalendarEventIds).toEqual([SHARED_COMPANY_EVENT_ID]);
    expect(otherCalendarEventIds).toEqual([OWN_EVENT_ID]);
  });

  it('should not match events whose title is hidden from the viewer', async () => {
    const { recordCalendarEventIds } =
      await searchTimelineCalendarEvents('larkspur pricing');

    expect(recordCalendarEventIds).toEqual([]);
  });

  it('should not search colleagues calendars in the fallback', async () => {
    const { otherCalendarEventIds } =
      await searchTimelineCalendarEvents('larkspur offsite');

    expect(otherCalendarEventIds).toEqual([]);
  });
});
