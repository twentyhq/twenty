import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type ComputeStepOutputSchemaFactoryInput = {
  step: Record<string, unknown>;
  coreWorkflowVersionId: string;
};

export const computeStepOutputSchemaQueryFactory = ({
  input,
}: PerformMetadataQueryParams<ComputeStepOutputSchemaFactoryInput>) => ({
  query: gql`
    mutation ComputeStepOutputSchema($input: ComputeStepOutputSchemaInput!) {
      computeStepOutputSchema(input: $input)
    }
  `,
  variables: {
    input: {
      step: input.step,
      coreWorkflowVersionId: input.coreWorkflowVersionId,
    },
  },
});
