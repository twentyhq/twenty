import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type DeleteOneRoleFactoryInput,
  deleteOneRoleQueryFactory,
} from 'test/integration/metadata/suites/role/utils/delete-one-role-query-factory.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteOneRole = async ({
  input,
  expectToFail = false,
}: PerformMetadataQueryParams<DeleteOneRoleFactoryInput>) => {
  const graphqlOperation = deleteOneRoleQueryFactory({
    input,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Role deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Role deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
