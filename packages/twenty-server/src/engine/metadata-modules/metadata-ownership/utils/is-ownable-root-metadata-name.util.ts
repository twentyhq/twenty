import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';

export const isOwnableRootMetadataName = (
  metadataName: string,
): metadataName is OwnableRootMetadataName =>
  Object.prototype.hasOwnProperty.call(
    OWNABLE_METADATA_BY_ROOT_METADATA_NAME,
    metadataName,
  );
