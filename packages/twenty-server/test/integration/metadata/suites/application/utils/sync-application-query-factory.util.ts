import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

export const syncApplicationQueryFactory = ({
  manifest,
  dryRun,
  allowDestructive,
  applyPlanId,
}: {
  manifest: Manifest;
  dryRun?: boolean;
  allowDestructive?: boolean;
  applyPlanId?: string;
}) => ({
  query: gql`
    mutation SyncApplication(
      $manifest: JSON!
      $dryRun: Boolean
      $allowDestructive: Boolean
      $applyPlanId: String
    ) {
      syncApplication(
        manifest: $manifest
        dryRun: $dryRun
        allowDestructive: $allowDestructive
        applyPlanId: $applyPlanId
      ) {
        applicationUniversalIdentifier
        actions
      }
    }
  `,
  variables: {
    manifest,
    dryRun,
    allowDestructive,
    applyPlanId,
  },
});
