import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowByIdFactoryInput = {
  coreWorkflowId: string;
};

export const findCoreWorkflowByIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowByIdFactoryInput>) => ({
  query: gql`
    query CoreWorkflowById($coreWorkflowId: UUID!) {
      coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
        id
      }
    }
  `,
  variables: { coreWorkflowId: input.coreWorkflowId },
});
