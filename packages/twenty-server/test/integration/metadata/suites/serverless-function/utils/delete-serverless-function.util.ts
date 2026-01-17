import {
  type DeleteServerlessFunctionFactoryInput,
  deleteServerlessFunctionQueryFactory,
} from 'test/integration/metadata/suites/serverless-function/utils/delete-serverless-function-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteServerlessFunction = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: DeleteServerlessFunctionFactoryInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  deleteOneServerlessFunction: { id: string };
}> => {
  const graphqlOperation = deleteServerlessFunctionQueryFactory({
    input,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Serverless Function deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Serverless Function deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
