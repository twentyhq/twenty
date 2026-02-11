import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteCoreViewFieldGroupQueryFactory } from 'test/integration/metadata/suites/view-field-group/utils/delete-core-view-field-group-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DeleteViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/delete-view-field-group.input';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';

export const deleteOneCoreViewFieldGroup = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<DeleteViewFieldGroupInput>): CommonResponseBody<{
  deleteCoreViewFieldGroup: ViewFieldGroupDTO;
}> => {
  const graphqlOperation = deleteCoreViewFieldGroupQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Field Group deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Field Group deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
