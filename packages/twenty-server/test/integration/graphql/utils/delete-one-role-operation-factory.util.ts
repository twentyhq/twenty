import gql from "graphql-tag";

// Open question unless I'm mistaken this should use the delete-one-record-factory as this is a metadata entry ?
export const deleteOneRoleOperationFactory = (roleId: string) => ({
  query: gql`
    mutation DeleteOneRole {
        deleteOneRole(roleId: "${roleId}")
      }
    `,
});
