import gql from 'graphql-tag';

export type DeleteServerlessFunctionFactoryInput = {
  id: string;
};

export const deleteServerlessFunctionQueryFactory = ({
  input,
}: {
  input: DeleteServerlessFunctionFactoryInput;
}) => ({
  query: gql`
    mutation DeleteOneServerlessFunction($input: ServerlessFunctionIdInput!) {
      deleteOneServerlessFunction(input: $input) {
        id
      }
    }
  `,
  variables: {
    input,
  },
});
