import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyCoreViewQueryFactory } from 'test/integration/metadata/suites/view/utils/destroy-core-view-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const destroyOneCoreView = async ({
  viewId,
  expectToFail,
}: {
  viewId: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  destroyCoreView: boolean;
}> => {
  const graphqlOperation = destroyCoreViewQueryFactory({
    viewId,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View destruction should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View destruction has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
