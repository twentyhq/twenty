import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowVersionsByCoreWorkflowIdFactoryInput = {
  coreWorkflowId: string;
};

export const findCoreWorkflowVersionsByCoreWorkflowIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowVersionsByCoreWorkflowIdFactoryInput>) => ({
  query: gql`
    query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
      coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
        id
      }
    }
  `,
  variables: { coreWorkflowId: input.coreWorkflowId },
});
