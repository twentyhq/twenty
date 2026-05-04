import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

// Properties the manifest sync is allowed to update on an existing row.
// Excludes:
//   - id / universalIdentifier / applicationId / workspaceId — identity, set
//     once at create time
//   - createdAt / updatedAt / deletedAt — managed by TypeORM
//   - name — used as a stable lookup key alongside applicationId, renaming
//     would break references; treat as immutable until we have a rename flow
export const FLAT_CONNECTION_PROVIDER_EDITABLE_PROPERTIES = [
  'displayName',
  'authorizationEndpoint',
  'tokenEndpoint',
  'revokeEndpoint',
  'scopes',
  'clientIdVariable',
  'clientSecretVariable',
  'authorizationParams',
  'tokenRequestContentType',
  'usePkce',
] as const satisfies MetadataEntityPropertyName<'connectionProvider'>[];
