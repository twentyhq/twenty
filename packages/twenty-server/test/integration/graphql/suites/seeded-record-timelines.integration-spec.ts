import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { OPPORTUNITY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

const PAGE_SIZE = 10;

// Person 1 (Mark Young at company 1, point of contact of opportunity 1) is
// referenced by hundreds of seeded message participants, so these records are
// the deterministic anchors for the junction read path. Calendar person
// participants are drawn uniformly from all seeded people, so the calendar
// case resolves its person from the seeded targets instead of naming one.
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
    }
  }
`;

const FIND_MESSAGE_THREAD_TARGETS = gql`
  query FindSeededMessageThreadTargets {
    messageThreadTargets(first: 1) {
      totalCount
    }
  }
`;

const FIND_CALENDAR_EVENT_TARGETS = gql`
  query FindSeededCalendarEventTargets {
    calendarEventTargets(first: 200) {
      totalCount
      edges {
        node {
          id
          targetPersonId
        }
      }
    }
  }
`;

const requestTimeline = (
  query: ReturnType<typeof gql>,
  objectNameSingular: string,
  recordId: string,
) =>
  makeGraphqlAPIRequest({
    query,
    variables: {
      objectNameSingular,
      recordId,
      page: 1,
      pageSize: PAGE_SIZE,
    },
  });

describe('seeded record timelines read from target junctions (integration)', () => {
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  it('should seed message thread targets', async () => {
    const response = await makeGraphqlAPIRequest({
      query: FIND_MESSAGE_THREAD_TARGETS,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.messageThreadTargets.totalCount).toBeGreaterThan(
      0,
    );
  });

  it('should seed calendar event targets', async () => {
    const response = await makeGraphqlAPIRequest({
      query: FIND_CALENDAR_EVENT_TARGETS,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.calendarEventTargets.totalCount).toBeGreaterThan(
      0,
    );
  });

  it('should serve the seeded person email timeline through targets', async () => {
    const response = await requestTimeline(
      GET_TIMELINE_THREADS,
      'person',
      PERSON_DATA_SEED_IDS.ID_1,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads,
    ).toBeGreaterThan(0);
  });

  it('should serve the seeded company email timeline through targets', async () => {
    const response = await requestTimeline(
      GET_TIMELINE_THREADS,
      'company',
      COMPANY_DATA_SEED_IDS.ID_1,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads,
    ).toBeGreaterThan(0);
  });

  it('should serve the seeded opportunity email timeline through targets', async () => {
    const response = await requestTimeline(
      GET_TIMELINE_THREADS,
      'opportunity',
      OPPORTUNITY_DATA_SEED_IDS.ID_1,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads,
    ).toBeGreaterThan(0);
  });

  it('should serve a calendar timeline for a person holding a seeded target', async () => {
    const targetsResponse = await makeGraphqlAPIRequest({
      query: FIND_CALENDAR_EVENT_TARGETS,
    });

    expect(targetsResponse.body.errors).toBeUndefined();

    const personTarget =
      targetsResponse.body.data.calendarEventTargets.edges.find(
        (edge: { node: { targetPersonId: string | null } }) =>
          edge.node.targetPersonId !== null,
      );

    expect(personTarget).toBeDefined();

    const response = await requestTimeline(
      GET_TIMELINE_CALENDAR_EVENTS,
      'person',
      personTarget.node.targetPersonId,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getTimelineCalendarEventsFromObjectRecord
        .totalNumberOfCalendarEvents,
    ).toBeGreaterThan(0);
  });
});
