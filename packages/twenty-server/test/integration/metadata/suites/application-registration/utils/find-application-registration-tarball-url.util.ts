import {
  type FindApplicationRegistrationTarballUrlFactoryInput,
  findApplicationRegistrationTarballUrlQueryFactory,
} from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-tarball-url-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findApplicationRegistrationTarballUrl = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindApplicationRegistrationTarballUrlFactoryInput>): CommonResponseBody<{
  applicationRegistrationTarballUrl: string | null;
}> => {
  const graphqlOperation = findApplicationRegistrationTarballUrlQueryFactory({
    input,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding application registration tarball url should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding application registration tarball url has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
