import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteCoreViewFilterGroupQueryFactory } from 'test/integration/metadata/suites/view-filter-group/utils/delete-core-view-filter-group-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteOneCoreViewFilterGroup = async ({
  id,
  expectToFail,
}: {
  id: string;
  expectToFail: boolean;
}): CommonResponseBody<{
  deleteCoreViewFilterGroup: boolean;
}> => {
  const graphqlOperation = deleteCoreViewFilterGroupQueryFactory({ id });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Filter Group deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Filter Group deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
