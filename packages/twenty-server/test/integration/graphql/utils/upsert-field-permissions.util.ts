import { upsertFieldPermissionsQueryFactory } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';

export const upsertFieldPermissions = async (
  input: UpsertFieldPermissionsInput,
) => {
  const graphqlOperation = upsertFieldPermissionsQueryFactory({ input });

  const response = await makeMetadataApiRequest(graphqlOperation);

  await waitForAllJobsToFinish();

  return {
    data: response.body.data,
    errors: response.body.errors,
  };
};
