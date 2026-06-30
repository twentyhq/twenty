import gql from 'graphql-tag';

export type DeleteLogicFunctionFactoryInput = {
  id: string;
};

export const deleteLogicFunctionQueryFactory = ({
  input,
}: {
  input: DeleteLogicFunctionFactoryInput;
}) => ({
  query: gql`
    mutation DeleteOneLogicFunction($input: LogicFunctionIdInput!) {
      deleteOneLogicFunction(input: $input) {
        id
      }
    }
  `,
  variables: {
    input,
  },
});
