import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  DeleteOneFieldFactoryInput,
  deleteOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-query-factory.util';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteOneFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<DeleteOneFieldFactoryInput>) => {
  const graphqlOperation = deleteOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata deletion should have failed but did not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
