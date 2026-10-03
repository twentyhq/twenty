import gql from 'graphql-tag';

export const applicationUpgradeRoleGrantsQueryFactory = ({
  applicationId,
}: {
  applicationId: string;
}) => ({
  query: gql`
    query ApplicationUpgradeRoleGrants($applicationId: UUID!) {
      applicationUpgradeRoleGrants(applicationId: $applicationId) {
        type
        action
        objectUniversalIdentifier
        fieldUniversalIdentifier
        permissionFlagUniversalIdentifier
      }
    }
  `,
  variables: { applicationId },
});
