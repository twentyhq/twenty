import { type AllMetadataName } from 'twenty-shared/metadata';

import { PRIVATABLE_METADATA_NAMES } from 'src/engine/permissions/metadata-permissions/constants/privatable-metadata-names.constant';
import { type PrivatableMetadataName } from 'src/engine/permissions/metadata-permissions/types/privatable-metadata-name.type';

export const isPrivatableMetadataName = (
  metadataName: AllMetadataName,
): metadataName is PrivatableMetadataName =>
  metadataName in PRIVATABLE_METADATA_NAMES;
