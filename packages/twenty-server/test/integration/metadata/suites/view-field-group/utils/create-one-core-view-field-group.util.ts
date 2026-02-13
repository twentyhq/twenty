import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createCoreViewFieldGroupQueryFactory } from 'test/integration/metadata/suites/view-field-group/utils/create-core-view-field-group-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';

export const createOneCoreViewFieldGroup = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<CreateViewFieldGroupInput>): CommonResponseBody<{
  createCoreViewFieldGroup: ViewFieldGroupDTO;
}> => {
  const graphqlOperation = createCoreViewFieldGroupQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Field Group creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Field Group creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
