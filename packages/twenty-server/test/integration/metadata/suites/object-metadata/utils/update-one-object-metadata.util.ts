import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  UpdateOneObjectFactoryInput,
  updateOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-query-factory.util';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const updateOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<UpdateOneObjectFactoryInput>) => {
  const graphqlOperation = updateOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata update should have failed but did not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
