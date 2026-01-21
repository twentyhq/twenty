import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateCoreViewSortQueryFactory } from 'test/integration/metadata/suites/view-sort/utils/update-core-view-sort-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';

export const updateOneCoreViewSort = async ({
  viewSortId,
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<UpdateViewSortInput> & {
  viewSortId: string;
}): CommonResponseBody<{
  updateCoreViewSort: ViewSortDTO;
}> => {
  const graphqlOperation = updateCoreViewSortQueryFactory({
    viewSortId,
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Sort update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Sort update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
