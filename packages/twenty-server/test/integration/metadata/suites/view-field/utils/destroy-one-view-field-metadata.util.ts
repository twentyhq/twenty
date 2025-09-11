import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyOneViewFieldMetadataQueryFactory } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field-metadata-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';
import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';

export const destroyOneViewFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<DestroyViewFieldInput>): CommonResponseBody<{
  destroyOneViewField: ViewFieldEntity;
}> => {
  const graphqlOperation = destroyOneViewFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Field destruction should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Field destruction has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
