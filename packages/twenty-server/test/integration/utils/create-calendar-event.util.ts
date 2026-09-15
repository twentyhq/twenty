import gql from 'graphql-tag';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type CreateCalendarEventInput = {
  connectedAccountId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  isFullDay?: boolean;
  timeZone?: string;
  attendees?: string;
  sendInvitations?: boolean;
  addConferencing?: boolean;
};

type CreateCalendarEventResult = {
  success: boolean;
  error?: string;
  iCalUid?: string;
  conferenceLink?: string;
};

const CREATE_CALENDAR_EVENT_MUTATION = gql`
  mutation CreateCalendarEventForIntegrationTest(
    $input: CreateCalendarEventInput!
  ) {
    createCalendarEvent(input: $input) {
      success
      error
      iCalUid
      conferenceLink
    }
  }
`;

export const createCalendarEvent = async (
  input: CreateCalendarEventInput,
): Promise<CreateCalendarEventResult> => {
  const response = await makeMetadataAPIRequest({
    query: CREATE_CALENDAR_EVENT_MUTATION,
    variables: { input },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createCalendarEvent;
};
