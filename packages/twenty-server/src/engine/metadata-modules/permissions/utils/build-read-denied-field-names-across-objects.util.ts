import { type ObjectsPermissions } from 'twenty-shared/types';

import { buildRestrictedFieldNames } from 'src/engine/core-modules/record-share/utils/build-restricted-field-names.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const buildReadDeniedFieldNamesAcrossObjects = ({
  objectsPermissions,
  flatFieldMetadataMaps,
}: {
  objectsPermissions: ObjectsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> =>
  buildRestrictedFieldNames({
    restrictedFields: Object.assign(
      {},
      ...Object.values(objectsPermissions).map(
        (objectPermissions) => objectPermissions.restrictedFields,
      ),
    ),
    flatFieldMetadataMaps,
  });
