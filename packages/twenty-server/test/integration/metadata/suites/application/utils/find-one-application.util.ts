import {
  type FindOneApplicationFactoryInput,
  findOneApplicationQueryFactory,
} from 'test/integration/metadata/suites/application/utils/find-one-application-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';

export const findOneApplication = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindOneApplicationFactoryInput>): CommonResponseBody<{
  findOneApplication: ApplicationDTO;
}> => {
  const graphqlOperation = findOneApplicationQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Finding application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Finding application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
