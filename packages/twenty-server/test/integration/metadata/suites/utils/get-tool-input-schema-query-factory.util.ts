import gql from 'graphql-tag';

export const getToolInputSchemaQueryFactory = ({
  toolName,
}: {
  toolName: string;
}) => ({
  query: gql`
    query GetToolInputSchema($toolName: String!) {
      getToolInputSchema(toolName: $toolName)
    }
  `,
  variables: { toolName },
});
