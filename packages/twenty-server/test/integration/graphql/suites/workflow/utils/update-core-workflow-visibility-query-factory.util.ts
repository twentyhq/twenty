import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { type WorkflowVisibility } from 'twenty-shared/types';

export type UpdateCoreWorkflowVisibilityFactoryInput = {
  coreWorkflowId: string;
  visibility: WorkflowVisibility;
};

export const updateCoreWorkflowVisibilityQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateCoreWorkflowVisibilityFactoryInput>) => ({
  query: gql`
    mutation UpdateCoreWorkflowVisibility(
      $input: UpdateCoreWorkflowVisibilityInput!
    ) {
      updateCoreWorkflowVisibility(input: $input) {
        id
        visibility
      }
    }
  `,
  variables: { input },
});
