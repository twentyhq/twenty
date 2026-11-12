import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

export type SyncApplicationManifestInput = Omit<Manifest, 'logicFunctions'> & {
  logicFunctions: object[];
};

export const syncApplicationQueryFactory = ({
  manifest,
  dryRun,
  inferDeletionFromMissingEntities,
}: {
  manifest: SyncApplicationManifestInput;
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
