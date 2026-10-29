import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const FIND_TIMELINE_ACTIVITY_TYPES = gql`
  query FindTimelineActivityTypes {
    timelineActivityTypes {
      id
    }
  }
`;

const UPDATE_TIMELINE_ACTIVITY_TYPE = gql`
  mutation UpdateTimelineActivityType(
    $input: UpdateTimelineActivityTypeInput!
  ) {
    updateTimelineActivityType(input: $input) {
      id
    }
  }
`;

describe('updateTimelineActivityType input validation', () => {
  it('should reject an unsupported translation locale', async () => {
    const findResponse = await makeMetadataApiRequest({
      query: FIND_TIMELINE_ACTIVITY_TYPES,
    });

    expect(findResponse.body.errors).toBeUndefined();

    const [timelineActivityType] = findResponse.body.data.timelineActivityTypes;

    const response = await makeMetadataApiRequest({
      query: UPDATE_TIMELINE_ACTIVITY_TYPE,
      variables: {
        input: {
          id: timelineActivityType.id,
          translations: [
            { locale: 'xx-XX', property: 'label', value: 'Invalid' },
          ],
        },
      },
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
