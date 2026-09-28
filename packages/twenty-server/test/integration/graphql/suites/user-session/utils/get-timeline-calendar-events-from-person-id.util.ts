import {
  type GetTimelineCalendarEventsFromPersonIdFactoryInput,
  getTimelineCalendarEventsFromPersonIdQueryFactory,
} from 'test/integration/graphql/suites/user-session/utils/get-timeline-calendar-events-from-person-id-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const getTimelineCalendarEventsFromPersonId = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<GetTimelineCalendarEventsFromPersonIdFactoryInput>): CommonResponseBody<{
  getTimelineCalendarEventsFromPersonId: {
    totalNumberOfCalendarEvents: number;
  };
}> => {
  const response = await makeGraphqlApiRequest(
    getTimelineCalendarEventsFromPersonIdQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading the person calendar timeline should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading the person calendar timeline has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
