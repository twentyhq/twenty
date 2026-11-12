import { type OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';

export type OwnableRootRow<TRootMetadataName extends OwnableRootMetadataName> =
  Pick<
    MetadataFlatEntity<TRootMetadataName>,
    Extract<
      (typeof OWNABLE_METADATA_BY_ROOT_METADATA_NAME)[TRootMetadataName][
        | 'visibilityProperty'
        | 'ownerProperty'],
      keyof MetadataFlatEntity<TRootMetadataName>
    >
  >;
