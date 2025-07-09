export const updateWorkspaceMemberRole = async ({
  client,
  roleId,
  workspaceMemberId,
}: {
  client: any;
  roleId: string;
  workspaceMemberId: string;
}) => {
  const updateMemberRoleQuery = {
    query: `
          mutation UpdateWorkspaceMemberRole {
            updateWorkspaceMemberRole(
              workspaceMemberId: "${workspaceMemberId}"
              roleId: "${roleId}"
            ) {
              id
              roles {
                id
                label
              }
            }
          }
        `,
  };

  await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send(updateMemberRoleQuery);
};
