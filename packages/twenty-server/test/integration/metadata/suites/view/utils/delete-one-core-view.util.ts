import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteCoreViewQueryFactory } from 'test/integration/metadata/suites/view/utils/delete-core-view-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteOneCoreView = async ({
  viewId,
  expectToFail,
}: {
  viewId: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  deleteCoreView: boolean;
}> => {
  const graphqlOperation = deleteCoreViewQueryFactory({
    viewId,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
