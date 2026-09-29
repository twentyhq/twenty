import {
  findAdminApplicationRegistrationVariablesQueryFactory,
  updateAdminApplicationRegistrationVariableMutationFactory,
} from 'test/integration/graphql/suites/admin-panel/utils/admin-application-registration-variable-query-factories.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type AdminVariable = {
  id: string;
  key: string;
  value: string | null;
  isSecret: boolean;
  isFilled: boolean;
};

type AdminResponse<TData> = Promise<{
  data: TData;
  errors: BaseGraphQLError[];
  rawBody: unknown;
}>;

export const findAdminApplicationRegistrationVariables = async ({
  applicationRegistrationId,
  token,
}: {
  applicationRegistrationId: string;
  token?: string;
}): AdminResponse<{
  findAdminApplicationRegistrationVariables: AdminVariable[];
}> => {
  const graphqlOperation =
    findAdminApplicationRegistrationVariablesQueryFactory({
      applicationRegistrationId,
    });

  const response = await makeAdminPanelApiRequest(graphqlOperation, token);

  return {
    data: response.body.data,
    errors: response.body.errors,
    rawBody: response.body,
  };
};

export const updateAdminApplicationRegistrationVariable = async ({
  id,
  value,
  token,
}: {
  id: string;
  value: string;
  token?: string;
}): AdminResponse<{
  updateAdminApplicationRegistrationVariable: AdminVariable;
}> => {
  const graphqlOperation =
    updateAdminApplicationRegistrationVariableMutationFactory({ id, value });

  const response = await makeAdminPanelApiRequest(graphqlOperation, token);

  return {
    data: response.body.data,
    errors: response.body.errors,
    rawBody: response.body,
  };
};
