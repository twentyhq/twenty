import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_PERMISSION_FLAG_DEFINITION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-permission-flag-definition/constants/flat-permission-flag-definition-editable-properties.constant';
import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import {
  PermissionFlagDefinitionException,
  PermissionFlagDefinitionExceptionCode,
} from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.exception';
import { type UpdatePermissionFlagDefinitionInput } from 'src/engine/metadata-modules/permission-flag-definition/dtos/update-permission-flag-definition.input';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdatePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionToUpdateOrThrow =
  ({
    flatPermissionFlagDefinitionMaps,
    updatePermissionFlagDefinitionInput,
  }: {
    flatPermissionFlagDefinitionMaps: FlatEntityMaps<FlatPermissionFlagDefinition>;
    updatePermissionFlagDefinitionInput: UpdatePermissionFlagDefinitionInput;
  }): FlatPermissionFlagDefinition => {
    const existing = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatePermissionFlagDefinitionInput.id,
      flatEntityMaps: flatPermissionFlagDefinitionMaps,
    });

    if (!isDefined(existing)) {
      throw new PermissionFlagDefinitionException(
        'Permission flag definition not found',
        PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND,
      );
    }

    return {
      ...mergeUpdateInExistingRecord({
        existing,
        properties: [...FLAT_PERMISSION_FLAG_DEFINITION_EDITABLE_PROPERTIES],
        update: updatePermissionFlagDefinitionInput.update,
      }),
      updatedAt: new Date().toISOString(),
    };
  };
