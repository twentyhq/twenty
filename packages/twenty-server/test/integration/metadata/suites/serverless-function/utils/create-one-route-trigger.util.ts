import {
  type CreateOneRouteTriggerFactoryInput,
  createOneRouteTriggerQueryFactory,
} from 'test/integration/metadata/suites/serverless-function/utils/create-one-route-trigger-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type RouteTriggerDTO } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger.dto';

export const createOneRouteTrigger = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateOneRouteTriggerFactoryInput>): CommonResponseBody<{
  createOneRouteTrigger: RouteTriggerDTO;
}> => {
  const graphqlOperation = createOneRouteTriggerQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Route Trigger creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Route Trigger creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
