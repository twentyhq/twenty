import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

export const planApplicationSyncQueryFactory = ({
  manifest,
}: {
  manifest: Manifest;
}) => ({
  query: gql`
    mutation PlanApplicationSync($manifest: JSON!) {
      planApplicationSync(manifest: $manifest) {
        applicationUniversalIdentifier
        isEmpty
        hasDestructiveActions
        currentVersion
        proposedVersion
        summary {
          createCount
          updateCount
          deleteCount
          breakingCount
          destructiveCount
          totalAffectedRows
        }
        actions {
          type
          metadataName
          universalIdentifier
          label
          severity
          affectedRowCount
        }
      }
    }
  `,
  variables: {
    manifest,
  },
});
