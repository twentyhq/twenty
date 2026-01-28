import gql from 'graphql-tag';

export type PublishLogicFunctionFactoryInput = {
  id: string;
};

const DEFAULT_LOGIC_FUNCTION_GQL_FIELDS = `
  id
  name
  latestVersion
  publishedVersions
`;

export const publishLogicFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_LOGIC_FUNCTION_GQL_FIELDS,
}: {
  input: PublishLogicFunctionFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation PublishLogicFunction($input: PublishLogicFunctionInput!) {
      publishLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
