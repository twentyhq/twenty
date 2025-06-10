import { gql } from 'apollo-server-core';
import { ConfigVariableValue } from 'twenty-shared/src/types/ConfigVariableValue';

export type CreateConfigVariableFactoryInput = {
  key: string;
  value: ConfigVariableValue;
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
