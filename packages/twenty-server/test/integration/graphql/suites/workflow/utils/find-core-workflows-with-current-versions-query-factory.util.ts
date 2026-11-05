import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowsWithCurrentVersionsFactoryInput = {
  coreWorkflowIds: string[];
};

export const findCoreWorkflowsWithCurrentVersionsQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowsWithCurrentVersionsFactoryInput>) => ({
  query: gql`
    query CoreWorkflowsWithCurrentVersions($coreWorkflowIds: [UUID!]!) {
      coreWorkflowsWithCurrentVersions(
        input: { coreWorkflowIds: $coreWorkflowIds }
      ) {
        workflow {
          id
        }
      }
    }
  `,
  variables: { coreWorkflowIds: input.coreWorkflowIds },
});
