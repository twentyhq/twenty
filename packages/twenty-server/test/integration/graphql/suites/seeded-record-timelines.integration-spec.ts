import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Guards the QA regression where dev seeds left the target junctions empty
// and every timeline rendered blank. Sibling suites in the same shard mutate
// individual seeded records, so per-record timeline assertions live in the
// deterministic seed-generator unit spec; here only workspace-level
// population is asserted, and read-path behavior is covered by
// timeline-from-object-record.integration-spec.ts with its own fixtures.
const FIND_MESSAGE_THREAD_TARGETS = gql`
  query FindSeededMessageThreadTargets {
    messageThreadTargets(first: 1) {
      totalCount
    }
  }
`;

const FIND_CALENDAR_EVENT_TARGETS = gql`
  query FindSeededCalendarEventTargets {
    calendarEventTargets(first: 1) {
      totalCount
    }
  }
`;

describe('seeded target junctions (integration)', () => {
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
});
