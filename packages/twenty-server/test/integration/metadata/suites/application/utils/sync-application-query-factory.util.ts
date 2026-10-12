import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

const DEFAULT_SYNC_APPLICATION_GQL_FIELDS = `
  applicationUniversalIdentifier
  actions
`;

export const syncApplicationQueryFactory = ({
  manifest,
  dryRun,
  inferDeletionFromMissingEntities,
  gqlFields = DEFAULT_SYNC_APPLICATION_GQL_FIELDS,
}: {
  manifest: Manifest;
  dryRun?: boolean;
  inferDeletionFromMissingEntities?: boolean;
  gqlFields?: string;
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
        ${gqlFields}
      }
    }
  `,
  variables: {
    manifest,
    dryRun,
    inferDeletionFromMissingEntities,
  },
});
