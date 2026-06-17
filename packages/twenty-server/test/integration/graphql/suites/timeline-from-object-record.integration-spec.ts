import gql from 'graphql-tag';
import { type DocumentNode } from 'graphql';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

const PAGE_SIZE = 50;
const PEOPLE_DISCOVERY_LIMIT = 100;

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

const getPeopleWithCompany = async (): Promise<
  { id: string; companyId: string }[]
> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id company { id }',
      first: PEOPLE_DISCOVERY_LIMIT,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return (
    response.body.data.people.edges
      // @ts-expect-error legacy noImplicitAny
      .map((edge) => edge.node)
      // @ts-expect-error legacy noImplicitAny
      .filter((person) => person.company?.id)
      // @ts-expect-error legacy noImplicitAny
      .map((person) => ({ id: person.id, companyId: person.company.id }))
  );
};

const findPersonWithThreads = async (
  people: { id: string; companyId: string }[],
) => {
  for (const person of people) {
    const response = await requestTimeline(
      GET_TIMELINE_THREADS,
      'person',
      person.id,
    );

    if (
      response.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads > 0
    ) {
      return person;
    }
  }

  return undefined;
};

const findPersonWithCalendarEvents = async (
  people: { id: string; companyId: string }[],
) => {
  for (const person of people) {
    const response = await requestTimeline(
      GET_TIMELINE_CALENDAR_EVENTS,
      'person',
      person.id,
    );

    if (
      response.body.data.getTimelineCalendarEventsFromObjectRecord
        .totalNumberOfCalendarEvents > 0
    ) {
      return person;
    }
  }

  return undefined;
};

describe('timeline from object record resolvers (integration)', () => {
  let personWithThreads: { id: string; companyId: string };
  let personWithEvents: { id: string; companyId: string };

  beforeAll(async () => {
    const people = await getPeopleWithCompany();

    const threadsSource = await findPersonWithThreads(people);
    const eventsSource = await findPersonWithCalendarEvents(people);

    if (!threadsSource || !eventsSource) {
      throw new Error(
        'Expected the seeded workspace to contain a person with message threads and calendar events',
      );
    }

    personWithThreads = threadsSource;
    personWithEvents = eventsSource;
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
