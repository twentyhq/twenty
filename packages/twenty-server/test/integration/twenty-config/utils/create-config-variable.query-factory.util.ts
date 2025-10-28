import { gql } from 'apollo-server-core';
import { type ConfigVariableValue } from 'twenty-shared/types';

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
