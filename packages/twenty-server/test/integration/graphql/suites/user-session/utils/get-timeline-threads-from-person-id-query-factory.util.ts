import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type GetTimelineThreadsFromPersonIdFactoryInput = {
  personId: string;
};

export const getTimelineThreadsFromPersonIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<GetTimelineThreadsFromPersonIdFactoryInput>) => ({
  query: gql`
    query GetTimelineThreadsFromPersonId(
      $personId: UUID!
      $page: Int!
      $pageSize: Int!
    ) {
      getTimelineThreadsFromPersonId(
        personId: $personId
        page: $page
        pageSize: $pageSize
      ) {
        totalNumberOfThreads
      }
    }
  `,
  variables: { personId: input.personId, page: 1, pageSize: 10 },
});
