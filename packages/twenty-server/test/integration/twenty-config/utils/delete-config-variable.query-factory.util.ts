import { gql } from 'graphql-tag';

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
