import { type PrivatableMetadataName } from 'src/engine/permissions/metadata-permissions/types/privatable-metadata-name.type';

export const PRIVATABLE_METADATA_NAMES = {
  view: true,
  workflow: true,
  agent: true,
} as const satisfies Record<PrivatableMetadataName, true>;
