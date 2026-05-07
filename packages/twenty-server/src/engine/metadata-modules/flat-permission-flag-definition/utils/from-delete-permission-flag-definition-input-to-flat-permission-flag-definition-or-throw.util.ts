import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import {
  PermissionFlagDefinitionException,
  PermissionFlagDefinitionExceptionCode,
} from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.exception';

export const fromDeletePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionOrThrow =
  ({
    flatPermissionFlagDefinitionMaps,
    permissionFlagDefinitionId,
  }: {
    flatPermissionFlagDefinitionMaps: FlatEntityMaps<FlatPermissionFlagDefinition>;
    permissionFlagDefinitionId: string;
  }): FlatPermissionFlagDefinition => {
    const existing = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: permissionFlagDefinitionId,
      flatEntityMaps: flatPermissionFlagDefinitionMaps,
    });

    if (!isDefined(existing)) {
      throw new PermissionFlagDefinitionException(
        'Permission flag definition not found',
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND,
      );
    }

    return existing;
  };
