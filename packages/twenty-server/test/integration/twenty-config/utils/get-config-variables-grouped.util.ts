import { getConfigVariablesGroupedQueryFactory } from './get-config-variables-grouped.query-factory.util';
import { makeAdminPanelAPIRequest } from './make-admin-panel-api-request.util';

export const getConfigVariablesGrouped = async (expectToFail = false) => {
  const graphqlOperation = getConfigVariablesGroupedQueryFactory();

  const response = await makeAdminPanelAPIRequest(graphqlOperation);

  if (!expectToFail) {
    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getConfigVariablesGrouped).toBeDefined();
  } else {
    expect(response.body.errors).toBeDefined();
  }

  return { data: response.body.data, errors: response.body.errors };
};
