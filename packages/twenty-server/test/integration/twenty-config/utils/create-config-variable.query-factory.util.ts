import { gql } from 'apollo-server-core';

export type CreateConfigVariableFactoryInput = {
  key: string;
  value: any;
};

export const createConfigVariableQueryFactory = ({
  key,
  value,
}: CreateConfigVariableFactoryInput) => {
  return {
    query: gql`
      mutation CreateDatabaseConfigVariable($key: String!, $value: JSON!) {
        createDatabaseConfigVariable(key: $key, value: $value)
      }
    `,
    variables: {
      key,
      value,
    },
  };
};
