import { type PerformTwentyConfigQueryParams } from 'test/integration/twenty-config/types/perform-twenty-config-query.type';

import {
  type GetConfigVariableFactoryInput,
  getConfigVariableQueryFactory,
} from './get-config-variable.query-factory.util';
import { makeAdminPanelAPIRequest } from './make-admin-panel-api-request.util';

export const getConfigVariable = async ({
  input,
  expectToFail = false,
}: PerformTwentyConfigQueryParams<GetConfigVariableFactoryInput>) => {
  const graphqlOperation = getConfigVariableQueryFactory({
    key: input.key,
  });

  const response = await makeAdminPanelAPIRequest(graphqlOperation);

  if (!expectToFail) {
    expect(response.body.data).toBeDefined();
    expect(response.body.data.getDatabaseConfigVariable).toBeDefined();
  } else {
    // For failure cases, we'll check in the individual tests
  }

  return {
    data: response.body.data,
    errors: response.body.errors,
    rawResponse: response,
  };
};
