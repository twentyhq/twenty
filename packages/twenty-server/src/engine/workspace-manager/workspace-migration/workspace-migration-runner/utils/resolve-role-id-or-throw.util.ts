import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export const resolveRoleIdOrThrow = ({
  roleUniversalIdentifier,
  flatRoleMaps,
}: {
  roleUniversalIdentifier: string;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): string => {
  const flatRole = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatRoleMaps,
    universalIdentifier: roleUniversalIdentifier,
  });

  if (!isDefined(flatRole)) {
    throw new FlatEntityMapsException(
      `Role not found for universal identifier: ${roleUniversalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatRole.id;
};
