import { gql } from 'apollo-server-core';

export type UpdateConfigVariableFactoryInput = {
  key: string;
  value: any;
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
