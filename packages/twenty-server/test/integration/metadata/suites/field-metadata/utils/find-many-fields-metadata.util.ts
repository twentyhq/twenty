import {
  FindManyFieldsMetadataFactoryInput,
  findManyFieldsMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';
import { makeMetadataAPIRequest } from 'test/integration/utils/make-metadata-api-request.util';

export const findManyFieldsMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<FindManyFieldsMetadataFactoryInput>) => {
  const graphqlOperation = findManyFieldsMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata retrieval should have failed but did not',
    });
  }

  return {
    errors: response.body.errors,
    fields: response.body.data.fields?.edges,
  };
};
