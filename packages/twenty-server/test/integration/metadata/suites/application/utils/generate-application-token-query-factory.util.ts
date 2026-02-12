import gql from 'graphql-tag';

export const generateApplicationTokenQueryFactory = ({
  applicationId,
}: {
  applicationId: string;
}) => ({
  query: gql`
    mutation GenerateApplicationToken($applicationId: UUID!) {
      generateApplicationToken(applicationId: $applicationId) {
        token
        expiresAt
      }
    }
  `,
  variables: {
    applicationId,
  },
});
