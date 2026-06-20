import gql from 'graphql-tag';
import { type DocumentNode } from 'graphql';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

const PAGE_SIZE = 50;

const GET_TIMELINE_THREADS = gql`
  query GetTimelineThreadsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      page: $page
      pageSize: $pageSize
    ) {
      totalNumberOfThreads
      timelineThreads {
        id
      }
    }
  }
`;

const GET_TIMELINE_CALENDAR_EVENTS = gql`
  query GetTimelineCalendarEventsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineCalendarEventsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      page: $page
      pageSize: $pageSize
    ) {
      totalNumberOfCalendarEvents
      timelineCalendarEvents {
        id
      }
    }
  }
`;

const THREADS_SELECTION = 'totalNumberOfThreads timelineThreads { id }';
const CALENDAR_SELECTION =
  'totalNumberOfCalendarEvents timelineCalendarEvents { id }';

const buildLegacyQuery = (
  queryName: string,
  idArgName: string,
  selection: string,
): DocumentNode =>
  gql`
    query ${queryName}($id: UUID!, $page: Int!, $pageSize: Int!) {
      ${queryName}(${idArgName}: $id, page: $page, pageSize: $pageSize) {
        ${selection}
      }
    }
  `;

const requestTimeline = (
  query: DocumentNode,
  objectNameSingular: string,
  recordId: string,
) =>
  makeGraphqlAPIRequest({
    query,
    variables: { objectNameSingular, recordId, page: 1, pageSize: PAGE_SIZE },
  });

// The timeline resolvers derive their data from a person's message
// participants and calendar event participants. This suite provisions its own
// self-contained graph (company -> person -> message thread/message/participant
// and calendar event/participant) instead of reading the dev-seeded data:
// sibling suites sharded alongside it legitimately wipe people via
// deleteAllRecords('person'), and the seeder assigns threads/events to random
// people — both of which made discovery here order- and seed-dependent.
const TIMELINE_COMPANY_ID = '20202020-7e57-4000-8000-000000000001';
const TIMELINE_PERSON_ID = '20202020-7e57-4000-8000-000000000002';
const TIMELINE_MESSAGE_THREAD_ID = '20202020-7e57-4000-8000-000000000003';
const TIMELINE_MESSAGE_ID = '20202020-7e57-4000-8000-000000000004';
const TIMELINE_MESSAGE_PARTICIPANT_ID = '20202020-7e57-4000-8000-000000000005';
const TIMELINE_CALENDAR_EVENT_ID = '20202020-7e57-4000-8000-000000000006';
const TIMELINE_CALENDAR_EVENT_PARTICIPANT_ID =
  '20202020-7e57-4000-8000-000000000007';

// Destroyed in afterAll in child-before-parent order to satisfy foreign keys.
const TIMELINE_FIXTURES: { objectMetadataSingularName: string; id: string }[] =
  [
    {
      objectMetadataSingularName: 'calendarEventParticipant',
      id: TIMELINE_CALENDAR_EVENT_PARTICIPANT_ID,
    },
    {
      objectMetadataSingularName: 'calendarEvent',
      id: TIMELINE_CALENDAR_EVENT_ID,
    },
    {
      objectMetadataSingularName: 'messageParticipant',
      id: TIMELINE_MESSAGE_PARTICIPANT_ID,
    },
    { objectMetadataSingularName: 'message', id: TIMELINE_MESSAGE_ID },
    {
      objectMetadataSingularName: 'messageThread',
      id: TIMELINE_MESSAGE_THREAD_ID,
    },
    { objectMetadataSingularName: 'person', id: TIMELINE_PERSON_ID },
    { objectMetadataSingularName: 'company', id: TIMELINE_COMPANY_ID },
  ];

const createTimelineRecord = async (
  objectMetadataSingularName: string,
  data: object,
) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

describe('timeline from object record resolvers (integration)', () => {
  let personWithThreads: { id: string; companyId: string };
  let personWithEvents: { id: string; companyId: string };

  beforeAll(async () => {
    await createTimelineRecord('company', {
      id: TIMELINE_COMPANY_ID,
      name: 'Timeline Source Company',
    });

    await createTimelineRecord('person', {
      id: TIMELINE_PERSON_ID,
      name: { firstName: 'Timeline', lastName: 'Source' },
      companyId: TIMELINE_COMPANY_ID,
    });

    await createTimelineRecord('messageThread', {
      id: TIMELINE_MESSAGE_THREAD_ID,
    });

    await createTimelineRecord('message', {
      id: TIMELINE_MESSAGE_ID,
      messageThreadId: TIMELINE_MESSAGE_THREAD_ID,
      subject: 'Timeline source thread',
      text: 'Timeline source message body',
      receivedAt: new Date().toISOString(),
    });

    await createTimelineRecord('messageParticipant', {
      id: TIMELINE_MESSAGE_PARTICIPANT_ID,
      messageId: TIMELINE_MESSAGE_ID,
      personId: TIMELINE_PERSON_ID,
      role: 'FROM',
      handle: 'timeline.source@example.com',
      displayName: 'Timeline Source',
    });

    await createTimelineRecord('calendarEvent', {
      id: TIMELINE_CALENDAR_EVENT_ID,
      title: 'Timeline source event',
      isFullDay: false,
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
    });

    await createTimelineRecord('calendarEventParticipant', {
      id: TIMELINE_CALENDAR_EVENT_PARTICIPANT_ID,
      calendarEventId: TIMELINE_CALENDAR_EVENT_ID,
      personId: TIMELINE_PERSON_ID,
      handle: 'timeline.source@example.com',
      displayName: 'Timeline Source',
      responseStatus: 'ACCEPTED',
      isOrganizer: true,
    });

    personWithThreads = {
      id: TIMELINE_PERSON_ID,
      companyId: TIMELINE_COMPANY_ID,
    };
    personWithEvents = {
      id: TIMELINE_PERSON_ID,
      companyId: TIMELINE_COMPANY_ID,
    };
  });

  afterAll(async () => {
    for (const { objectMetadataSingularName, id } of TIMELINE_FIXTURES) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('should derive a company message timeline from its related people', async () => {
    const [personResponse, companyResponse] = await Promise.all([
      requestTimeline(GET_TIMELINE_THREADS, 'person', personWithThreads.id),
      requestTimeline(
        GET_TIMELINE_THREADS,
        'company',
        personWithThreads.companyId,
      ),
    ]);

    expect(personResponse.body.errors).toBeUndefined();
    expect(companyResponse.body.errors).toBeUndefined();

    const personThreadCount =
      personResponse.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads;
    const companyThreadCount =
      companyResponse.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads;

    expect(personThreadCount).toBeGreaterThan(0);
    expect(companyThreadCount).toBeGreaterThanOrEqual(personThreadCount);
  });

  it('should derive a company calendar timeline from its related people', async () => {
    const [personResponse, companyResponse] = await Promise.all([
      requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        'person',
        personWithEvents.id,
      ),
      requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        'company',
        personWithEvents.companyId,
      ),
    ]);

    expect(personResponse.body.errors).toBeUndefined();
    expect(companyResponse.body.errors).toBeUndefined();

    const personEventCount =
      personResponse.body.data.getTimelineCalendarEventsFromObjectRecord
        .totalNumberOfCalendarEvents;
    const companyEventCount =
      companyResponse.body.data.getTimelineCalendarEventsFromObjectRecord
        .totalNumberOfCalendarEvents;

    expect(personEventCount).toBeGreaterThan(0);
    expect(companyEventCount).toBeGreaterThanOrEqual(personEventCount);
  });

  it('should serve getTimelineThreadsFromPersonId identically to the object-record resolver', async () => {
    const [fromObjectRecord, fromLegacy] = await Promise.all([
      requestTimeline(GET_TIMELINE_THREADS, 'person', personWithThreads.id),
      makeGraphqlAPIRequest({
        query: buildLegacyQuery(
          'getTimelineThreadsFromPersonId',
          'personId',
          THREADS_SELECTION,
        ),
        variables: { id: personWithThreads.id, page: 1, pageSize: PAGE_SIZE },
      }),
    ]);

    expect(fromLegacy.body.errors).toBeUndefined();
    expect(fromLegacy.body.data.getTimelineThreadsFromPersonId).toEqual(
      fromObjectRecord.body.data.getTimelineThreadsFromObjectRecord,
    );
  });

  it('should serve getTimelineThreadsFromCompanyId identically to the object-record resolver', async () => {
    const [fromObjectRecord, fromLegacy] = await Promise.all([
      requestTimeline(
        GET_TIMELINE_THREADS,
        'company',
        personWithThreads.companyId,
      ),
      makeGraphqlAPIRequest({
        query: buildLegacyQuery(
          'getTimelineThreadsFromCompanyId',
          'companyId',
          THREADS_SELECTION,
        ),
        variables: {
          id: personWithThreads.companyId,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      }),
    ]);

    expect(fromLegacy.body.errors).toBeUndefined();
    expect(fromLegacy.body.data.getTimelineThreadsFromCompanyId).toEqual(
      fromObjectRecord.body.data.getTimelineThreadsFromObjectRecord,
    );
  });

  it('should serve getTimelineCalendarEventsFromPersonId identically to the object-record resolver', async () => {
    const [fromObjectRecord, fromLegacy] = await Promise.all([
      requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        'person',
        personWithEvents.id,
      ),
      makeGraphqlAPIRequest({
        query: buildLegacyQuery(
          'getTimelineCalendarEventsFromPersonId',
          'personId',
          CALENDAR_SELECTION,
        ),
        variables: { id: personWithEvents.id, page: 1, pageSize: PAGE_SIZE },
      }),
    ]);

    expect(fromLegacy.body.errors).toBeUndefined();
    expect(fromLegacy.body.data.getTimelineCalendarEventsFromPersonId).toEqual(
      fromObjectRecord.body.data.getTimelineCalendarEventsFromObjectRecord,
    );
  });

  it('should serve getTimelineCalendarEventsFromCompanyId identically to the object-record resolver', async () => {
    const [fromObjectRecord, fromLegacy] = await Promise.all([
      requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        'company',
        personWithEvents.companyId,
      ),
      makeGraphqlAPIRequest({
        query: buildLegacyQuery(
          'getTimelineCalendarEventsFromCompanyId',
          'companyId',
          CALENDAR_SELECTION,
        ),
        variables: {
          id: personWithEvents.companyId,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      }),
    ]);

    expect(fromLegacy.body.errors).toBeUndefined();
    expect(fromLegacy.body.data.getTimelineCalendarEventsFromCompanyId).toEqual(
      fromObjectRecord.body.data.getTimelineCalendarEventsFromObjectRecord,
    );
  });

  describe('with a custom object that has no people on its timeline', () => {
    const CUSTOM_OBJECT_NAME_SINGULAR = 'timelineProbe';
    const CUSTOM_RECORD_ID = '20202020-cccc-4000-8000-0000000000a1';

    let customObjectMetadataId: string;

    beforeAll(async () => {
      const { data } = await createOneObjectMetadata({
        input: {
          nameSingular: CUSTOM_OBJECT_NAME_SINGULAR,
          namePlural: 'timelineProbes',
          labelSingular: 'Timeline Probe',
          labelPlural: 'Timeline Probes',
          icon: 'IconRadar',
        },
        expectToFail: false,
      });

      customObjectMetadataId = data.createOneObject.id;

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: CUSTOM_OBJECT_NAME_SINGULAR,
          gqlFields: 'id',
          data: { id: CUSTOM_RECORD_ID, name: 'Probe' },
        }),
      );
    });

    afterAll(async () => {
      await updateOneObjectMetadata({
        input: {
          idToUpdate: customObjectMetadataId,
          updatePayload: { isActive: false },
        },
        expectToFail: false,
      });

      await deleteOneObjectMetadata({
        input: { idToDelete: customObjectMetadataId },
        expectToFail: false,
      });
    });

    it('should return an empty message timeline instead of crashing', async () => {
      const response = await requestTimeline(
        GET_TIMELINE_THREADS,
        CUSTOM_OBJECT_NAME_SINGULAR,
        CUSTOM_RECORD_ID,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.getTimelineThreadsFromObjectRecord
          .totalNumberOfThreads,
      ).toBe(0);
      expect(
        response.body.data.getTimelineThreadsFromObjectRecord.timelineThreads,
      ).toEqual([]);
    });

    it('should return an empty calendar timeline instead of crashing', async () => {
      const response = await requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        CUSTOM_OBJECT_NAME_SINGULAR,
        CUSTOM_RECORD_ID,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.getTimelineCalendarEventsFromObjectRecord
          .totalNumberOfCalendarEvents,
      ).toBe(0);
      expect(
        response.body.data.getTimelineCalendarEventsFromObjectRecord
          .timelineCalendarEvents,
      ).toEqual([]);
    });
  });
});
