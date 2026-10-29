import { findTimelineActivityTypesQueryFactory } from 'test/integration/metadata/suites/timeline-activity-type/utils/find-timeline-activity-types-query-factory.util';
import { updateTimelineActivityTypeQueryFactory } from 'test/integration/metadata/suites/timeline-activity-type/utils/update-timeline-activity-type-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('updateTimelineActivityType input validation', () => {
  it('should reject an unsupported translation locale', async () => {
    const findResponse = await makeMetadataApiRequest(
      findTimelineActivityTypesQueryFactory(),
    );

    expect(findResponse.body.errors).toBeUndefined();

    const [timelineActivityType] = findResponse.body.data.timelineActivityTypes;

    const response = await makeMetadataApiRequest(
      updateTimelineActivityTypeQueryFactory({
        input: {
          id: timelineActivityType.id,
          translations: [
            { locale: 'xx-XX', property: 'label', value: 'Invalid' },
          ],
        },
      }),
    );

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
