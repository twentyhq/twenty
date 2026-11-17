import gql from 'graphql-tag';

export const stopGenerateQueryFactory = ({ runId }: { runId: string }) => ({
  query: gql`
    mutation StopGenerate($input: StopGenerateInput!) {
      stopGenerate(input: $input)
    }
  `,
  variables: { input: { runId } },
});
