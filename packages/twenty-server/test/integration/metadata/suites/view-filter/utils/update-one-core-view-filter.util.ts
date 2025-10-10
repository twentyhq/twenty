import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateCoreViewFilterQueryFactory } from 'test/integration/metadata/suites/view-filter/utils/update-core-view-filter-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';

export const updateOneCoreViewFilter = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<UpdateViewFilterInput>): CommonResponseBody<{
  updateCoreViewFilter: ViewFilterDTO;
}> => {
  const graphqlOperation = updateCoreViewFilterQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Filter update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Filter update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
