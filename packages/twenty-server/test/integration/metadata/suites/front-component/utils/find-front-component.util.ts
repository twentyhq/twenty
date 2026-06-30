import {
  type FindFrontComponentFactoryInput,
  findFrontComponentQueryFactory,
} from 'test/integration/metadata/suites/front-component/utils/find-front-component-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';

export const findFrontComponent = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindFrontComponentFactoryInput>): CommonResponseBody<{
  frontComponent: FrontComponentDTO;
}> => {
  const graphqlOperation = findFrontComponentQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Finding front component should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Finding front component has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
