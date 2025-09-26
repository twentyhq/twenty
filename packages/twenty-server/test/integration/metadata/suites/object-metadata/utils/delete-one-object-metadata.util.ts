import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type DeleteOneObjectFactoryInput,
  deleteOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<DeleteOneObjectFactoryInput>) => {
  const graphqlOperation = deleteOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Object Metadata deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
