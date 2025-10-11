import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteCoreViewFilterQueryFactory } from 'test/integration/metadata/suites/view-filter/utils/delete-core-view-filter-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';

export const deleteOneCoreViewFilter = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<DeleteViewFilterInput>): CommonResponseBody<{
  deleteCoreViewFilter: ViewFilterDTO;
}> => {
  const graphqlOperation = deleteCoreViewFilterQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Filter deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Filter deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
