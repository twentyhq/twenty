import { gql } from 'apollo-server-core';
import { ConfigVariableValue } from 'twenty-shared/src/types/ConfigVariableValue';

export type UpdateConfigVariableFactoryInput = {
  key: string;
  value: ConfigVariableValue;
};

export const updateConfigVariableQueryFactory = ({
  key,
  value,
}: UpdateConfigVariableFactoryInput) => {
  return {
    query: gql`
      mutation UpdateDatabaseConfigVariable($key: String!, $value: JSON!) {
        updateDatabaseConfigVariable(key: $key, value: $value)
      }
    `,
    variables: {
      key,
      value,
    },
  };
};
