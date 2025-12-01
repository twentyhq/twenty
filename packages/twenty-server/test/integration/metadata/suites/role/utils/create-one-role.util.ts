import {
  type CreateOneRoleFactoryInput,
  createOneRoleQueryFactory,
} from 'test/integration/metadata/suites/role/utils/create-one-role-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const createOneRole = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateOneRoleFactoryInput>): CommonResponseBody<{
  createOneRole: RoleDTO;
}> => {
  const graphqlOperation = createOneRoleQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Role creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Role creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
