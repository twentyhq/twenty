import { PerformMetadataQueryParams } from 'test/integration/graphql/types/perform-metadata-query.type';
import { makeMetadataAPIRequest } from 'test/integration/graphql/utils/make-metadata-api-request.util';
import {
  FindManyFieldsMetadataFactoryInput,
  findManyFieldsMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findManyFieldsMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<FindManyFieldsMetadataFactoryInput>) => {
  const operation = findManyFieldsMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest({
    operation,
  });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata retrieval should have failed but did not',
    });
  }

  return response;
};
