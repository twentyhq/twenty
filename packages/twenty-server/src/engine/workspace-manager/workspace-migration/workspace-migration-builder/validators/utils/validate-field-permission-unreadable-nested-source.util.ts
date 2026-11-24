import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFieldPermissionUnreadableNestedSource = ({
  flatFieldPermission,
  flatFieldMetadataMaps,
}: {
  flatFieldPermission: Pick<
    UniversalFlatFieldPermission,
    | 'fieldMetadataUniversalIdentifier'
    | 'sourceFieldMetadataUniversalIdentifier'
    | 'rowLevelPermissionPredicateGroupUniversalIdentifier'
    | 'rowLevelPermissionRuleUniversalIdentifier'
  >;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  const { sourceFieldMetadataUniversalIdentifier } = flatFieldPermission;

  if (!isDefined(sourceFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    !isDefined(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: sourceFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
  ) {
    errors.push({
      code: PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
      message: t`Source field metadata not found`,
      userFriendlyMessage: msg`Source field not found`,
    });
  }

  if (
    sourceFieldMetadataUniversalIdentifier ===
    flatFieldPermission.fieldMetadataUniversalIdentifier
  ) {
    errors.push({
      code: PermissionsExceptionCode.INVALID_SETTING,
      message: t`A nested unreadable field cannot use itself as its source`,
      userFriendlyMessage: msg`A nested unreadable field cannot use itself as its source`,
    });
  }

  if (
    isDefined(
      flatFieldPermission.rowLevelPermissionPredicateGroupUniversalIdentifier,
    ) ||
    isDefined(flatFieldPermission.rowLevelPermissionRuleUniversalIdentifier)
  ) {
    errors.push({
      code: PermissionsExceptionCode.INVALID_SETTING,
      message: t`A nested unreadable field cannot be tied to a row level permission rule`,
      userFriendlyMessage: msg`A nested unreadable field cannot be tied to a row level permission rule`,
    });
  }

  return errors;
};
