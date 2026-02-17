import { createOneApplicationQueryFactory } from 'test/integration/metadata/suites/application/utils/create-one-application-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type CreatedApplication = {
  id: string;
  universalIdentifier: string;
  name: string;
};

export const createOneApplication = async ({
  universalIdentifier,
  name,
  description,
  version,
  sourcePath,
  expectToFail = false,
  token,
}: {
  universalIdentifier: string;
  name: string;
  description?: string;
  version: string;
  sourcePath: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  createOneApplication: CreatedApplication;
}> => {
  const graphqlOperation = createOneApplicationQueryFactory({
    universalIdentifier,
    name,
    description,
    version,
    sourcePath,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Create one application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Create one application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
