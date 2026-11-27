import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateCoreWorkflowIsPrivateFactoryInput = {
  coreWorkflowId: string;
  isPrivate: boolean;
};

export const updateCoreWorkflowIsPrivateQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateCoreWorkflowIsPrivateFactoryInput>) => ({
  query: gql`
    mutation UpdateCoreWorkflowIsPrivate($input: UpdateCoreWorkflowInput!) {
      updateCoreWorkflow(input: $input) {
        id
        isPrivate
      }
    }
  `,
  variables: { input },
});
