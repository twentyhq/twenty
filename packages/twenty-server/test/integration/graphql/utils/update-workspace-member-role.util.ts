import gql from "graphql-tag";
import { makeGraphqlAPIRequest } from "test/integration/graphql/utils/make-graphql-api-request.util";

export const updateWorkspaceMemberRole = async ({
  roleId,
  workspaceMemberId,
}: {
  roleId: string;
  workspaceMemberId: string;
}) => {
  const updateMemberRoleQuery = {
    query: gql`
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


  return await makeGraphqlAPIRequest({
    operation: updateMemberRoleQuery
  })
};
