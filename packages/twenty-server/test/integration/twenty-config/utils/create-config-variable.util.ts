import { type PerformTwentyConfigQueryParams } from 'test/integration/twenty-config/types/perform-twenty-config-query.type';

import {
  type CreateConfigVariableFactoryInput,
  createConfigVariableQueryFactory,
} from './create-config-variable.query-factory.util';
import { makeAdminPanelAPIRequest } from './make-admin-panel-api-request.util';

export const createConfigVariable = async ({
  input,
  expectToFail = false,
}: PerformTwentyConfigQueryParams<CreateConfigVariableFactoryInput>) => {
  const graphqlOperation = createConfigVariableQueryFactory({
    key: input.key,
    value: input.value,
  });

  const response = await makeAdminPanelAPIRequest(graphqlOperation);

  if (!expectToFail) {
    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createDatabaseConfigVariable).toBeDefined();
  } else {
    // For failure cases, we'll check in the individual tests
  }

  return {
    data: response.body.data,
    errors: response.body.errors,
    rawResponse: response,
  };
};
