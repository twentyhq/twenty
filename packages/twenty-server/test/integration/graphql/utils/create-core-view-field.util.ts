import gql from 'graphql-tag';
import { type CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { createViewFieldOperationFactory } from 'twenty-shared/mutations';

// Could be SDK generated
export const createCoreViewField = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<CreateViewFieldInput>): CommonResponseBody<{
  createCoreViewField: ViewFieldDTO;
}> => {
  const graphqlOperation = {
    query: gql`${createViewFieldOperationFactory(gqlFields)}`,
    variables: {
      input,
    },
  };

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
