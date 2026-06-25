import {
  type UpsertFieldPermissionsFactoryInput,
  upsertFieldPermissionsQueryFactory,
} from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';

export const upsertFieldPermissions = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<UpsertFieldPermissionsFactoryInput>): CommonResponseBody<{
  upsertFieldPermissions: FieldPermissionDTO[];
}> => {
  const graphqlOperation = upsertFieldPermissionsQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field permissions upsert should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Field permissions upsert has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
