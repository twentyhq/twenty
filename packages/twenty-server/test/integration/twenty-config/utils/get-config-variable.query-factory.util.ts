import { gql } from 'apollo-server-core';

export type GetConfigVariableFactoryInput = {
  key: string;
};

export const getConfigVariableQueryFactory = ({
  key,
}: GetConfigVariableFactoryInput) => {
  return {
    query: gql`
      query GetDatabaseConfigVariable($key: String!) {
        getDatabaseConfigVariable(key: $key) {
          name
          description
          value
          isSensitive
          isEnvOnly
          type
          options
          source
        }
      }
    `,
    variables: {
      key,
    },
  };
};
