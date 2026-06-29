import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

export const syncApplicationQueryFactory = ({
  manifest,
  dryRun,
  allowDestructive,
}: {
  manifest: Manifest;
  dryRun?: boolean;
  allowDestructive?: boolean;
}) => ({
  query: gql`
    mutation SyncApplication(
      $manifest: JSON!
      $dryRun: Boolean
      $allowDestructive: Boolean
    ) {
      syncApplication(
        manifest: $manifest
        dryRun: $dryRun
        allowDestructive: $allowDestructive
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
  },
});
