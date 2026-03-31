import { upsertFieldPermissionsQueryFactory } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';

export const upsertFieldPermissions = async (
  input: UpsertFieldPermissionsInput,
) => {
  const graphqlOperation = upsertFieldPermissionsQueryFactory({ input });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  return {
    data: response.body.data,
    errors: response.body.errors,
  };
};
