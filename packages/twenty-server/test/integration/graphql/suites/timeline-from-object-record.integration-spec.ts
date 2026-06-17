import gql from 'graphql-tag';
import { type DocumentNode } from 'graphql';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

const TEST_COMPANY_ID = '20202020-aaaa-4000-8000-0000000000a1';
const TEST_PERSON_1_ID = '20202020-bbbb-4000-8000-0000000000a1';
const TEST_PERSON_2_ID = '20202020-bbbb-4000-8000-0000000000a2';
const TEST_OPPORTUNITY_ID = '20202020-dddd-4000-8000-0000000000a1';
const PAGE_SIZE = 50;

type TimelineThreadsWithTotal = {
  totalNumberOfThreads: number;
  timelineThreads: { id: string }[];
};

type TimelineCalendarEventsWithTotal = {
  totalNumberOfCalendarEvents: number;
  timelineCalendarEvents: { id: string }[];
};

const GET_TIMELINE_THREADS_FROM_OBJECT_RECORD = gql`
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

const GET_TIMELINE_CALENDAR_EVENTS_FROM_OBJECT_RECORD = gql`
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

const requestObjectRecord = (
  query: DocumentNode,
  objectNameSingular: string,
  recordId: string,
) =>
  makeGraphqlAPIRequest({
    query,
    variables: { objectNameSingular, recordId, page: 1, pageSize: PAGE_SIZE },
  });

const requestLegacy = (query: DocumentNode, recordId: string) =>
  makeGraphqlAPIRequest({
    query,
    variables: { id: recordId, page: 1, pageSize: PAGE_SIZE },
  });

const LEGACY_DELEGATION_CASES = [
  {
    objectNameSingular: 'person',
    recordId: TEST_PERSON_1_ID,
    threadsQueryName: 'getTimelineThreadsFromPersonId',
    calendarQueryName: 'getTimelineCalendarEventsFromPersonId',
    idArgName: 'personId',
  },
  {
    objectNameSingular: 'company',
    recordId: TEST_COMPANY_ID,
    threadsQueryName: 'getTimelineThreadsFromCompanyId',
    calendarQueryName: 'getTimelineCalendarEventsFromCompanyId',
    idArgName: 'companyId',
  },
  {
    objectNameSingular: 'opportunity',
    recordId: TEST_OPPORTUNITY_ID,
    threadsQueryName: 'getTimelineThreadsFromOpportunityId',
    calendarQueryName: 'getTimelineCalendarEventsFromOpportunityId',
    idArgName: 'opportunityId',
  },
];

describe('timeline from object record resolvers (integration)', () => {
  beforeAll(async () => {
    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: TEST_COMPANY_ID, name: 'TimelineFromObjectRecordCompany' },
        ],
        upsert: true,
      }),
    );

    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: [
          { id: TEST_PERSON_1_ID, companyId: TEST_COMPANY_ID },
          { id: TEST_PERSON_2_ID, companyId: TEST_COMPANY_ID },
        ],
        upsert: true,
      }),
    );

    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          {
            id: TEST_OPPORTUNITY_ID,
            name: 'TimelineFromObjectRecordOpportunity',
            pointOfContactId: TEST_PERSON_1_ID,
          },
        ],
        upsert: true,
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        filter: { id: { in: [TEST_OPPORTUNITY_ID] } },
      }),
    );
    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: [TEST_PERSON_1_ID, TEST_PERSON_2_ID] } },
      }),
    );
    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: [TEST_COMPANY_ID] } },
      }),
    );
  });

  it('should resolve a company message timeline through its related people', async () => {
    const response = await requestObjectRecord(
      GET_TIMELINE_THREADS_FROM_OBJECT_RECORD,
      'company',
      TEST_COMPANY_ID,
    );

    expect(response.body.errors).toBeUndefined();

    const result: TimelineThreadsWithTotal =
      response.body.data.getTimelineThreadsFromObjectRecord;

    expect(result.totalNumberOfThreads).toBe(0);
    expect(result.timelineThreads).toEqual([]);
  });

  it('should resolve a company calendar timeline through its related people', async () => {
    const response = await requestObjectRecord(
      GET_TIMELINE_CALENDAR_EVENTS_FROM_OBJECT_RECORD,
      'company',
      TEST_COMPANY_ID,
    );

    expect(response.body.errors).toBeUndefined();

    const result: TimelineCalendarEventsWithTotal =
      response.body.data.getTimelineCalendarEventsFromObjectRecord;

    expect(result.totalNumberOfCalendarEvents).toBe(0);
    expect(result.timelineCalendarEvents).toEqual([]);
  });

  describe.each(LEGACY_DELEGATION_CASES)(
    'legacy endpoints for $objectNameSingular',
    ({
      objectNameSingular,
      recordId,
      threadsQueryName,
      calendarQueryName,
      idArgName,
    }) => {
      it(`should serve ${threadsQueryName} identically to the object-record resolver`, async () => {
        const [fromObjectRecord, fromLegacy] = await Promise.all([
          requestObjectRecord(
            GET_TIMELINE_THREADS_FROM_OBJECT_RECORD,
            objectNameSingular,
            recordId,
          ),
          requestLegacy(
            buildLegacyQuery(threadsQueryName, idArgName, THREADS_SELECTION),
            recordId,
          ),
        ]);

        expect(fromLegacy.body.errors).toBeUndefined();
        expect(fromLegacy.body.data[threadsQueryName]).toEqual(
          fromObjectRecord.body.data.getTimelineThreadsFromObjectRecord,
        );
      });

      it(`should serve ${calendarQueryName} identically to the object-record resolver`, async () => {
        const [fromObjectRecord, fromLegacy] = await Promise.all([
          requestObjectRecord(
            GET_TIMELINE_CALENDAR_EVENTS_FROM_OBJECT_RECORD,
            objectNameSingular,
            recordId,
          ),
          requestLegacy(
            buildLegacyQuery(calendarQueryName, idArgName, CALENDAR_SELECTION),
            recordId,
          ),
        ]);

        expect(fromLegacy.body.errors).toBeUndefined();
        expect(fromLegacy.body.data[calendarQueryName]).toEqual(
          fromObjectRecord.body.data.getTimelineCalendarEventsFromObjectRecord,
        );
      });
    },
  );

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
      const response = await makeGraphqlAPIRequest({
        query: GET_TIMELINE_THREADS_FROM_OBJECT_RECORD,
        variables: {
          objectNameSingular: CUSTOM_OBJECT_NAME_SINGULAR,
          recordId: CUSTOM_RECORD_ID,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result: TimelineThreadsWithTotal =
        response.body.data.getTimelineThreadsFromObjectRecord;

      expect(result.totalNumberOfThreads).toBe(0);
      expect(result.timelineThreads).toEqual([]);
    });

    it('should return an empty calendar timeline instead of crashing', async () => {
      const response = await makeGraphqlAPIRequest({
        query: GET_TIMELINE_CALENDAR_EVENTS_FROM_OBJECT_RECORD,
        variables: {
          objectNameSingular: CUSTOM_OBJECT_NAME_SINGULAR,
          recordId: CUSTOM_RECORD_ID,
          page: 1,
          pageSize: PAGE_SIZE,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const result: TimelineCalendarEventsWithTotal =
        response.body.data.getTimelineCalendarEventsFromObjectRecord;

      expect(result.totalNumberOfCalendarEvents).toBe(0);
      expect(result.timelineCalendarEvents).toEqual([]);
    });
  });
});
