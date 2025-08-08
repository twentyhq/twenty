import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';

export const deleteRole = async (client: any, roleId: string) => {
  const deleteRoleQuery = deleteOneRoleOperationFactory(roleId);

  await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send(deleteRoleQuery);
};
