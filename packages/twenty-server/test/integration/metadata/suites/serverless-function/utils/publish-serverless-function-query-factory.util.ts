import gql from 'graphql-tag';

export type PublishServerlessFunctionFactoryInput = {
  id: string;
};

const DEFAULT_SERVERLESS_FUNCTION_GQL_FIELDS = `
  id
  name
  latestVersion
  publishedVersions
`;

export const publishServerlessFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_SERVERLESS_FUNCTION_GQL_FIELDS,
}: {
  input: PublishServerlessFunctionFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation PublishServerlessFunction($input: PublishServerlessFunctionInput!) {
      publishServerlessFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
