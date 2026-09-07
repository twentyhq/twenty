import gql from 'graphql-tag';
import { type DocumentNode } from 'graphql';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

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
  page = 1,
  pageSize = PAGE_SIZE,
) =>
  makeGraphqlAPIRequest({
    query,
    variables: { objectNameSingular, recordId, page, pageSize },
  });

const TIMELINE_COMPANY_ID = '20202020-7e57-4000-8000-000000000001';
const TIMELINE_PERSON_ID = '20202020-7e57-4000-8000-000000000002';
const TIMELINE_MESSAGE_THREAD_ID = '20202020-7e57-4000-8000-000000000003';
const TIMELINE_MESSAGE_ID = '20202020-7e57-4000-8000-000000000004';
const TIMELINE_MESSAGE_PARTICIPANT_ID = '20202020-7e57-4000-8000-000000000005';
const TIMELINE_CALENDAR_EVENT_ID = '20202020-7e57-4000-8000-000000000006';
const TIMELINE_CALENDAR_EVENT_PARTICIPANT_ID =
  '20202020-7e57-4000-8000-000000000007';
const TIMELINE_MESSAGE_THREAD_PERSON_TARGET_ID =
  '20202020-7e57-4000-8000-000000000008';
const TIMELINE_MESSAGE_THREAD_COMPANY_TARGET_ID =
  '20202020-7e57-4000-8000-000000000009';
const TIMELINE_CALENDAR_EVENT_PERSON_TARGET_ID =
  '20202020-7e57-4000-8000-00000000000a';
const TIMELINE_CALENDAR_EVENT_COMPANY_TARGET_ID =
  '20202020-7e57-4000-8000-00000000000b';
const TIMELINE_MANUAL_COMPANY_ID = '20202020-7e57-4000-8000-00000000000c';
const TIMELINE_MESSAGE_THREAD_MANUAL_COMPANY_TARGET_ID =
  '20202020-7e57-4000-8000-00000000000d';
const TIMELINE_CALENDAR_EVENT_MANUAL_COMPANY_TARGET_ID =
  '20202020-7e57-4000-8000-00000000000e';
const TIMELINE_SECOND_MESSAGE_THREAD_ID =
  '20202020-7e57-4000-8000-00000000000f';
const TIMELINE_SECOND_MESSAGE_ID = '20202020-7e57-4000-8000-000000000010';
const TIMELINE_SECOND_MESSAGE_THREAD_TARGET_ID =
  '20202020-7e57-4000-8000-000000000011';
const TIMELINE_SECOND_CALENDAR_EVENT_ID =
  '20202020-7e57-4000-8000-000000000012';
const TIMELINE_SECOND_CALENDAR_EVENT_TARGET_ID =
  '20202020-7e57-4000-8000-000000000013';
const TIMELINE_SECOND_MESSAGE_PARTICIPANT_ID =
  '20202020-7e57-4000-8000-000000000014';

// Destroyed in afterAll in child-before-parent order to satisfy foreign keys.
const TIMELINE_FIXTURES: { objectMetadataSingularName: string; id: string }[] =
  [
    {
      objectMetadataSingularName: 'calendarEventTarget',
      id: TIMELINE_SECOND_CALENDAR_EVENT_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'messageThreadTarget',
      id: TIMELINE_SECOND_MESSAGE_THREAD_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'calendarEventTarget',
      id: TIMELINE_CALENDAR_EVENT_MANUAL_COMPANY_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'messageThreadTarget',
      id: TIMELINE_MESSAGE_THREAD_MANUAL_COMPANY_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'calendarEventTarget',
      id: TIMELINE_CALENDAR_EVENT_COMPANY_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'calendarEventTarget',
      id: TIMELINE_CALENDAR_EVENT_PERSON_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'messageThreadTarget',
      id: TIMELINE_MESSAGE_THREAD_COMPANY_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'messageThreadTarget',
      id: TIMELINE_MESSAGE_THREAD_PERSON_TARGET_ID,
    },
    {
      objectMetadataSingularName: 'calendarEventParticipant',
      id: TIMELINE_CALENDAR_EVENT_PARTICIPANT_ID,
    },
    {
      objectMetadataSingularName: 'calendarEvent',
      id: TIMELINE_CALENDAR_EVENT_ID,
    },
    {
      objectMetadataSingularName: 'calendarEvent',
      id: TIMELINE_SECOND_CALENDAR_EVENT_ID,
    },
    {
      objectMetadataSingularName: 'messageParticipant',
      id: TIMELINE_MESSAGE_PARTICIPANT_ID,
    },
    {
      objectMetadataSingularName: 'messageParticipant',
      id: TIMELINE_SECOND_MESSAGE_PARTICIPANT_ID,
    },
    { objectMetadataSingularName: 'message', id: TIMELINE_MESSAGE_ID },
    {
      objectMetadataSingularName: 'message',
      id: TIMELINE_SECOND_MESSAGE_ID,
    },
    {
      objectMetadataSingularName: 'messageThread',
      id: TIMELINE_MESSAGE_THREAD_ID,
    },
    {
      objectMetadataSingularName: 'messageThread',
      id: TIMELINE_SECOND_MESSAGE_THREAD_ID,
    },
    { objectMetadataSingularName: 'person', id: TIMELINE_PERSON_ID },
    { objectMetadataSingularName: 'company', id: TIMELINE_MANUAL_COMPANY_ID },
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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED,
      value: true,
      expectToFail: false,
    });

    await createTimelineRecord('company', {
      id: TIMELINE_COMPANY_ID,
      name: 'Timeline Source Company',
    });

    await createTimelineRecord('person', {
      id: TIMELINE_PERSON_ID,
      name: { firstName: 'Timeline', lastName: 'Source' },
      companyId: TIMELINE_COMPANY_ID,
    });

    await createTimelineRecord('company', {
      id: TIMELINE_MANUAL_COMPANY_ID,
      name: 'Timeline Manual Company',
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

    await createTimelineRecord('messageThreadTarget', {
      id: TIMELINE_MESSAGE_THREAD_PERSON_TARGET_ID,
      messageThreadId: TIMELINE_MESSAGE_THREAD_ID,
      targetPersonId: TIMELINE_PERSON_ID,
    });

    await createTimelineRecord('messageThreadTarget', {
      id: TIMELINE_MESSAGE_THREAD_COMPANY_TARGET_ID,
      messageThreadId: TIMELINE_MESSAGE_THREAD_ID,
      targetCompanyId: TIMELINE_COMPANY_ID,
    });

    await createTimelineRecord('messageThreadTarget', {
      id: TIMELINE_MESSAGE_THREAD_MANUAL_COMPANY_TARGET_ID,
      messageThreadId: TIMELINE_MESSAGE_THREAD_ID,
      targetCompanyId: TIMELINE_MANUAL_COMPANY_ID,
    });

    await createTimelineRecord('messageThread', {
      id: TIMELINE_SECOND_MESSAGE_THREAD_ID,
    });

    await createTimelineRecord('message', {
      id: TIMELINE_SECOND_MESSAGE_ID,
      messageThreadId: TIMELINE_SECOND_MESSAGE_THREAD_ID,
      subject: 'Second timeline target thread',
      text: 'Second timeline target message body',
      receivedAt: new Date(Date.now() + 60_000).toISOString(),
    });

    await createTimelineRecord('messageParticipant', {
      id: TIMELINE_SECOND_MESSAGE_PARTICIPANT_ID,
      messageId: TIMELINE_SECOND_MESSAGE_ID,
      personId: TIMELINE_PERSON_ID,
      role: 'FROM',
      handle: 'timeline.source@example.com',
      displayName: 'Timeline Source',
    });

    await createTimelineRecord('messageThreadTarget', {
      id: TIMELINE_SECOND_MESSAGE_THREAD_TARGET_ID,
      messageThreadId: TIMELINE_SECOND_MESSAGE_THREAD_ID,
      targetCompanyId: TIMELINE_MANUAL_COMPANY_ID,
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

    await createTimelineRecord('calendarEventTarget', {
      id: TIMELINE_CALENDAR_EVENT_PERSON_TARGET_ID,
      calendarEventId: TIMELINE_CALENDAR_EVENT_ID,
      targetPersonId: TIMELINE_PERSON_ID,
    });

    await createTimelineRecord('calendarEventTarget', {
      id: TIMELINE_CALENDAR_EVENT_COMPANY_TARGET_ID,
      calendarEventId: TIMELINE_CALENDAR_EVENT_ID,
      targetCompanyId: TIMELINE_COMPANY_ID,
    });

    await createTimelineRecord('calendarEventTarget', {
      id: TIMELINE_CALENDAR_EVENT_MANUAL_COMPANY_TARGET_ID,
      calendarEventId: TIMELINE_CALENDAR_EVENT_ID,
      targetCompanyId: TIMELINE_MANUAL_COMPANY_ID,
    });

    await createTimelineRecord('calendarEvent', {
      id: TIMELINE_SECOND_CALENDAR_EVENT_ID,
      title: 'Second timeline target event',
      isFullDay: false,
      startsAt: new Date(Date.now() + 60_000).toISOString(),
      endsAt: new Date(Date.now() + 120_000).toISOString(),
    });

    await createTimelineRecord('calendarEventTarget', {
      id: TIMELINE_SECOND_CALENDAR_EVENT_TARGET_ID,
      calendarEventId: TIMELINE_SECOND_CALENDAR_EVENT_ID,
      targetCompanyId: TIMELINE_MANUAL_COMPANY_ID,
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

  it('should expose manual company targets without a related person', async () => {
    const [threadResponse, calendarResponse] = await Promise.all([
      requestTimeline(
        GET_TIMELINE_THREADS,
        'company',
        TIMELINE_MANUAL_COMPANY_ID,
      ),
      requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        'company',
        TIMELINE_MANUAL_COMPANY_ID,
      ),
    ]);

    expect(threadResponse.body.errors).toBeUndefined();
    expect(calendarResponse.body.errors).toBeUndefined();
    expect(
      threadResponse.body.data.getTimelineThreadsFromObjectRecord.timelineThreads.map(
        ({ id }: { id: string }) => id,
      ),
    ).toContain(TIMELINE_MESSAGE_THREAD_ID);
    expect(
      calendarResponse.body.data.getTimelineCalendarEventsFromObjectRecord.timelineCalendarEvents.map(
        ({ id }: { id: string }) => id,
      ),
    ).toContain(TIMELINE_CALENDAR_EVENT_ID);
  });

  it.each([
    {
      query: GET_TIMELINE_THREADS,
      resultField: 'getTimelineThreadsFromObjectRecord',
      recordsField: 'timelineThreads',
      totalField: 'totalNumberOfThreads',
      expectedIds: [
        TIMELINE_MESSAGE_THREAD_ID,
        TIMELINE_SECOND_MESSAGE_THREAD_ID,
      ],
    },
    {
      query: GET_TIMELINE_CALENDAR_EVENTS,
      resultField: 'getTimelineCalendarEventsFromObjectRecord',
      recordsField: 'timelineCalendarEvents',
      totalField: 'totalNumberOfCalendarEvents',
      expectedIds: [
        TIMELINE_CALENDAR_EVENT_ID,
        TIMELINE_SECOND_CALENDAR_EVENT_ID,
      ],
    },
  ])(
    'should paginate target-backed $recordsField without changing the total',
    async ({ query, resultField, recordsField, totalField, expectedIds }) => {
      const [firstPageResponse, secondPageResponse] = await Promise.all([
        requestTimeline(query, 'company', TIMELINE_MANUAL_COMPANY_ID, 1, 1),
        requestTimeline(query, 'company', TIMELINE_MANUAL_COMPANY_ID, 2, 1),
      ]);

      expect(firstPageResponse.body.errors).toBeUndefined();
      expect(secondPageResponse.body.errors).toBeUndefined();

      const firstPage = firstPageResponse.body.data[resultField];
      const secondPage = secondPageResponse.body.data[resultField];
      const pageIds = [...firstPage[recordsField], ...secondPage[recordsField]]
        .map(({ id }: { id: string }) => id)
        .sort();

      expect(firstPage[totalField]).toBe(2);
      expect(secondPage[totalField]).toBe(2);
      expect(firstPage[recordsField]).toHaveLength(1);
      expect(secondPage[recordsField]).toHaveLength(1);
      expect(pageIds).toEqual([...expectedIds].sort());
    },
  );

  it('should exclude soft-deleted target tombstones', async () => {
    for (const [objectMetadataSingularName, recordId] of [
      ['messageThreadTarget', TIMELINE_MESSAGE_THREAD_MANUAL_COMPANY_TARGET_ID],
      ['calendarEventTarget', TIMELINE_CALENDAR_EVENT_MANUAL_COMPANY_TARGET_ID],
      ['messageThreadTarget', TIMELINE_SECOND_MESSAGE_THREAD_TARGET_ID],
      ['calendarEventTarget', TIMELINE_SECOND_CALENDAR_EVENT_TARGET_ID],
    ] as const) {
      const response = await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId,
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    const [threadResponse, calendarResponse] = await Promise.all([
      requestTimeline(
        GET_TIMELINE_THREADS,
        'company',
        TIMELINE_MANUAL_COMPANY_ID,
      ),
      requestTimeline(
        GET_TIMELINE_CALENDAR_EVENTS,
        'company',
        TIMELINE_MANUAL_COMPANY_ID,
      ),
    ]);

    expect(threadResponse.body.errors).toBeUndefined();
    expect(calendarResponse.body.errors).toBeUndefined();

    expect(
      threadResponse.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads,
    ).toBe(0);
    expect(
      calendarResponse.body.data.getTimelineCalendarEventsFromObjectRecord
        .totalNumberOfCalendarEvents,
    ).toBe(0);
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
