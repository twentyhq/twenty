import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteCoreViewSortQueryFactory } from 'test/integration/metadata/suites/view-sort/utils/delete-core-view-sort-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';

export const deleteOneCoreViewSort = async ({
  viewSortId,
  gqlFields,
  expectToFail,
}: {
  viewSortId: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  deleteCoreViewSort: ViewSortDTO;
}> => {
  const graphqlOperation = deleteCoreViewSortQueryFactory({
    viewSortId,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Sort deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Sort deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
