import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createCoreViewFieldQueryFactory } from 'test/integration/metadata/suites/view-field/utils/create-core-view-field-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const createOneCoreViewField = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<CreateViewFieldInput>): CommonResponseBody<{
  createCoreViewField: ViewFieldEntity;
}> => {
  const graphqlOperation = createCoreViewFieldQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Field creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Field creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
