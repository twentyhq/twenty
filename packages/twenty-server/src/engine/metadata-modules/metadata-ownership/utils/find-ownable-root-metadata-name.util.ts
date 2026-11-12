import { type AllMetadataName } from 'twenty-shared/metadata';

import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { isOwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/utils/is-ownable-root-metadata-name.util';

export const findOwnableRootMetadataName = (
  metadataName: AllMetadataName,
): OwnableRootMetadataName | undefined =>
  isOwnableRootMetadataName(metadataName)
    ? metadataName
    : Object.keys(OWNABLE_METADATA_BY_ROOT_METADATA_NAME)
        .filter(isOwnableRootMetadataName)
        .find((rootMetadataName) =>
          Object.prototype.hasOwnProperty.call(
            OWNABLE_METADATA_BY_ROOT_METADATA_NAME[rootMetadataName].children,
            metadataName,
          ),
        );
