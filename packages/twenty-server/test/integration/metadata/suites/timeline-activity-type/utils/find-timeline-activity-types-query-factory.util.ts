import gql from 'graphql-tag';

export const findTimelineActivityTypesQueryFactory = () => ({
  query: gql`
    query FindTimelineActivityTypes {
      timelineActivityTypes {
        id
      }
    }
  `,
});
