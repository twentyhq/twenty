import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowVersionByIdFactoryInput = {
  coreWorkflowVersionId: string;
};

export const findCoreWorkflowVersionByIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowVersionByIdFactoryInput>) => ({
  query: gql`
    query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
      coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
        id
        steps
      }
    }
  `,
  variables: { coreWorkflowVersionId: input.coreWorkflowVersionId },
});
