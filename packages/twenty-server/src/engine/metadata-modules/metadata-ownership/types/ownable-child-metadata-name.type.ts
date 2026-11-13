import { type OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';

export type OwnableChildMetadataName<
  TRootMetadataName extends OwnableRootMetadataName = OwnableRootMetadataName,
> = {
  [
    P in TRootMetadataName
  ]: keyof (typeof OWNABLE_METADATA_BY_ROOT_METADATA_NAME)[P]['children'];
}[TRootMetadataName];
