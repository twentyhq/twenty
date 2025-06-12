import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

export const deleteRole = async (roleId: string) => {
  const deleteRoleQuery = deleteOneRoleOperationFactory(roleId);

  return await makeGraphqlAPIRequest({
    operation: deleteRoleQuery,
  });
};
