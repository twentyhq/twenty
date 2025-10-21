import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteCoreViewGroupQueryFactory } from 'test/integration/metadata/suites/view-group/utils/delete-core-view-group-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const deleteOneCoreViewGroup = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<DeleteViewGroupInput>): CommonResponseBody<{
  deleteCoreViewGroup: ViewGroupEntity;
}> => {
  const graphqlOperation = deleteCoreViewGroupQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Group deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Group deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
