import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

export const syncApplicationQueryFactory = ({
  manifest,
  dryRun,
  inferDeletionFromMissingEntities,
}: {
  manifest: Manifest;
  dryRun?: boolean;
  inferDeletionFromMissingEntities?: boolean;
}) => ({
  query: gql`
    mutation SyncApplication(
      $manifest: JSON!
      $dryRun: Boolean
      $inferDeletionFromMissingEntities: Boolean
    ) {
      syncApplication(
        manifest: $manifest
        dryRun: $dryRun
        inferDeletionFromMissingEntities: $inferDeletionFromMissingEntities
      ) {
        applicationUniversalIdentifier
        actions
      }
    }
  `,
  variables: {
    manifest,
    dryRun,
    inferDeletionFromMissingEntities,
  },
});
