import { myAppPreferencesApplicationsQueryFactory } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AppPreferencesApplicationDTO } from 'src/engine/core-modules/application/application-variable/dtos/app-preferences-application.dto';

export const myAppPreferencesApplications = async ({
  input,
  gqlFields,
  token,
  expectToFail = false,
}: PerformMetadataQueryParams<Record<string, never>>): CommonResponseBody<{
  myAppPreferencesApplications: AppPreferencesApplicationDTO[];
}> => {
  const response = await makeMetadataApiRequest(
    myAppPreferencesApplicationsQueryFactory({ input, gqlFields }),
    token,
  );

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Listing personal application preferences should have failed',
    });
  } else {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Listing personal application preferences should have succeeded',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
