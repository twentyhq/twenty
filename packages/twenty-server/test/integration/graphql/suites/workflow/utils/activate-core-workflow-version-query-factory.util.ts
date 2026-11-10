import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type ActivateCoreWorkflowVersionFactoryInput = {
  coreWorkflowVersionId: string;
};

export const activateCoreWorkflowVersionQueryFactory = ({
  input,
}: PerformMetadataQueryParams<ActivateCoreWorkflowVersionFactoryInput>) => ({
  query: gql`
    mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
      activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
    }
  `,
  variables: { coreWorkflowVersionId: input.coreWorkflowVersionId },
});
