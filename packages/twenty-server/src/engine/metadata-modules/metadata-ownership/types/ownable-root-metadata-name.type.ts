import { type OWNABLE_ROOT_METADATA_NAMES } from 'src/engine/metadata-modules/metadata-ownership/constants/ownable-root-metadata-names.constant';

export type OwnableRootMetadataName =
  (typeof OWNABLE_ROOT_METADATA_NAMES)[number];
