import gql from 'graphql-tag';

export const updateTimelineActivityTypeQueryFactory = ({
  input,
}: {
  input: Record<string, unknown>;
}) => ({
  query: gql`
    mutation UpdateTimelineActivityType(
      $input: UpdateTimelineActivityTypeInput!
    ) {
      updateTimelineActivityType(input: $input) {
        id
      }
    }
  `,
  variables: { input },
});
