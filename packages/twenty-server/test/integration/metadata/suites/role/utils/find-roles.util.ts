import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findRolesQueryFactory } from 'test/integration/metadata/suites/role/utils/find-roles-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const findRoles = async ({
  gqlFields,
  expectToFail,
  token,
}: {
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
} = {}): CommonResponseBody<{
  getRoles: RoleDTO[];
}> => {
  const graphqlOperation = findRolesQueryFactory({
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Role search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Role search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
