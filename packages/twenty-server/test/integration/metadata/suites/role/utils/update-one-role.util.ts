import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type UpdateOneRoleFactoryInput,
  updateOneRoleQueryFactory,
} from 'test/integration/metadata/suites/role/utils/update-one-role-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const updateOneRole = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<UpdateOneRoleFactoryInput>): CommonResponseBody<{
  updateOneRole: RoleDTO;
}> => {
  const graphqlOperation = updateOneRoleQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Role update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Role update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
