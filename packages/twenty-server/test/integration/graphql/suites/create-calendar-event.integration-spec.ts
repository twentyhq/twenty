import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const NON_EXISTENT_CONNECTED_ACCOUNT_ID =
  '00000000-0000-4000-8000-000000000000';

const CREATE_CALENDAR_EVENT_MUTATION = gql`
  mutation CreateCalendarEvent($input: CreateCalendarEventInput!) {
    createCalendarEvent(input: $input) {
      success
      error
      iCalUid
      conferenceLink
    }
  }
`;

// Creating an actual event hits Google/Microsoft and cannot be integration-tested
// without real OAuth + provider mocking. The auth + ownership + validation paths,
// however, fail closed before any provider call — so we assert the mutation is
// wired into the metadata schema and returns a structured failure (never a 500)
// for an account that does not exist.
describe('createCalendarEvent (metadata API) (e2e)', () => {
  it('fails closed with a structured error when the connected account does not exist', async () => {
    const response = await makeMetadataAPIRequest({
      query: CREATE_CALENDAR_EVENT_MUTATION,
      variables: {
        input: {
          connectedAccountId: NON_EXISTENT_CONNECTED_ACCOUNT_ID,
          title: 'Integration test event',
          startsAt: '2026-07-01T15:00:00Z',
          endsAt: '2026-07-01T16:00:00Z',
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const result = response.body.data.createCalendarEvent;

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
    expect(result.iCalUid).toBeNull();
    expect(result.conferenceLink).toBeNull();
  });
});
