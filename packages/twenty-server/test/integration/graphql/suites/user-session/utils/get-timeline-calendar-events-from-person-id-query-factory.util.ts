import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type GetTimelineCalendarEventsFromPersonIdFactoryInput = {
  personId: string;
};

export const getTimelineCalendarEventsFromPersonIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<GetTimelineCalendarEventsFromPersonIdFactoryInput>) => ({
  query: gql`
    query GetTimelineCalendarEventsFromPersonId(
      $personId: UUID!
      $page: Int!
      $pageSize: Int!
    ) {
      getTimelineCalendarEventsFromPersonId(
        personId: $personId
        page: $page
        pageSize: $pageSize
      ) {
        totalNumberOfCalendarEvents
      }
    }
  `,
  variables: { personId: input.personId, page: 1, pageSize: 10 },
});
