import { getToolIndexQueryFactory } from 'test/integration/graphql/suites/application-role-intersection/utils/get-tool-index-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const getToolIndex = async ({
  expectToFail = false,
  token,
}: {
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  getToolIndex: { name: string; category: string }[];
}> => {
  const response = await makeMetadataAPIRequest(
    getToolIndexQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'getToolIndex should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'getToolIndex has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
