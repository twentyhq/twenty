import {
  type UpsertPermissionFlagGrantsFactoryInput,
  upsertPermissionFlagGrantsQueryFactory,
} from 'test/integration/metadata/suites/permission-flag-grant/utils/upsert-permission-flag-grants-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type PermissionFlagGrantDTO } from 'src/engine/metadata-modules/permission-flag-grant/dtos/permission-flag-grant.dto';

export const upsertPermissionFlagGrants = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<UpsertPermissionFlagGrantsFactoryInput>): CommonResponseBody<{
  upsertPermissionFlagGrants: PermissionFlagGrantDTO[];
}> => {
  const graphqlOperation = upsertPermissionFlagGrantsQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Permission flags upsert should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Permission flags upsert has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
