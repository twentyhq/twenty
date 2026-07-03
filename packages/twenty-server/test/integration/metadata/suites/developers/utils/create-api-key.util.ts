import {
  type CreateApiKeyInput,
  createApiKeyQueryFactory,
} from 'test/integration/metadata/suites/developers/utils/create-api-key-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';

export const createApiKey = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: {
  input: CreateApiKeyInput;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  createApiKey: ApiKeyEntity;
}> => {
  const graphqlOperation = createApiKeyQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'API key creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'API key creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
