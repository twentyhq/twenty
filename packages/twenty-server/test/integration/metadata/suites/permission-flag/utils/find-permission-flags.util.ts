import { findPermissionFlagsQueryFactory } from 'test/integration/metadata/suites/permission-flag/utils/find-permission-flags-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';

export const findPermissionFlags = async ({
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<void>): CommonResponseBody<{
  permissionFlags: PermissionFlagDTO[];
}> => {
  const graphqlOperation = findPermissionFlagsQueryFactory({
    input: undefined,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'PermissionFlags query should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'PermissionFlags query has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
