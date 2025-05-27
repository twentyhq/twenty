import { gql } from 'apollo-server-core';

export type DeleteConfigVariableFactoryInput = {
  key: string;
};

export const deleteConfigVariableQueryFactory = ({
  key,
}: DeleteConfigVariableFactoryInput) => {
  return {
    query: gql`
      mutation DeleteDatabaseConfigVariable($key: String!) {
        deleteDatabaseConfigVariable(key: $key)
      }
    `,
    variables: {
      key,
    },
  };
};
