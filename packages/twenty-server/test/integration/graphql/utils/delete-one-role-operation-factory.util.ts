import gql from "graphql-tag";

export const deleteOneRoleOperationFactory = (roleId: string) => ({
  query: gql`
    mutation DeleteOneRole {
        deleteOneRole(roleId: "${roleId}")
      }
    `,
});
