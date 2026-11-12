import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowsFactoryInput = {
  filter?: Record<string, unknown>;
};

export const findCoreWorkflowsQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowsFactoryInput>) => ({
  query: gql`
    query CoreWorkflows($filter: CoreWorkflowFilterInput) {
      coreWorkflows(first: 200, filter: $filter) {
        edges {
          node {
            id
          }
        }
        totalCount
      }
    }
  `,
  variables: { filter: input.filter },
});
