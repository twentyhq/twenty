import gql from 'graphql-tag';

export const checkWorkspaceSubdomainAvailabilityQueryFactory = ({
  subdomain,
}: {
  subdomain: string;
}) => ({
  query: gql`
    query CheckWorkspaceSubdomainAvailability($subdomain: String!) {
      checkWorkspaceSubdomainAvailability(subdomain: $subdomain) {
        isValid
        available
        suggestedSubdomains
      }
    }
  `,
  variables: { subdomain },
});
