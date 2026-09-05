/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { RowLevelPermissionPredicateGroupExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate-group.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatRowLevelPermissionPredicateGroupValidatorService {
  validateFlatRowLevelPermissionPredicateGroupCreation({
    flatEntityToValidate: flatPredicateGroupToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicateGroup', 'create'> {
    const {
      flatRowLevelPermissionPredicateGroupMaps:
        optimisticFlatPredicateGroupMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatSharingRuleMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPredicateGroupToValidate.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicateGroup',
      type: 'create',
    });

    const existingPredicateGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPredicateGroupToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPredicateGroupMaps,
    });

    if (isDefined(existingPredicateGroup)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
        message: t`Row level permission predicate group with this universal identifier already exists`,
        userFriendlyMessage: msg`Row level permission predicate group already exists`,
      });
    }

    if (
      isDefined(
        flatPredicateGroupToValidate.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      )
    ) {
      const parentGroup = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatPredicateGroupToValidate.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
        flatEntityMaps: optimisticFlatPredicateGroupMaps,
      });

      if (!isDefined(parentGroup)) {
        validationResult.errors.push({
          code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
          message: t`Parent row level permission predicate group not found`,
          userFriendlyMessage: msg`Parent row level permission predicate group not found`,
        });
      } else if (
        parentGroup.roleUniversalIdentifier !==
          flatPredicateGroupToValidate.roleUniversalIdentifier ||
        parentGroup.sharingRuleUniversalIdentifier !==
          flatPredicateGroupToValidate.sharingRuleUniversalIdentifier
      ) {
        validationResult.errors.push(this.getParentGroupMismatchError());
      }
    }

    validationResult.errors.push(
      ...this.getParentErrors({
        predicateGroup: flatPredicateGroupToValidate,
        flatRoleMaps,
        flatSharingRuleMaps,
      }),
    );

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            flatPredicateGroupToValidate.objectMetadataUniversalIdentifier,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionPredicateGroupDeletion({
    flatEntityToValidate: flatPredicateGroupToDelete,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicateGroup', 'delete'> {
    const {
      flatRowLevelPermissionPredicateGroupMaps:
        optimisticFlatPredicateGroupMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPredicateGroupToDelete.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicateGroup',
      type: 'delete',
    });

    const existingPredicateGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPredicateGroupToDelete.universalIdentifier,
      flatEntityMaps: optimisticFlatPredicateGroupMaps,
    });

    if (!isDefined(existingPredicateGroup)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND,
        message: t`Row level permission predicate group to delete not found`,
        userFriendlyMessage: msg`Row level permission predicate group to delete not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionPredicateGroupUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicateGroup', 'update'> {
    const {
      flatRowLevelPermissionPredicateGroupMaps:
        optimisticFlatPredicateGroupMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatSharingRuleMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    const existingPredicateGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPredicateGroupMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicateGroup',
      type: 'update',
    });

    if (!isDefined(existingPredicateGroup)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND,
        message: t`Row level permission predicate group to update not found`,
        userFriendlyMessage: msg`Row level permission predicate group to update not found`,
      });

      return validationResult;
    }

    const updatedPredicateGroup = {
      ...existingPredicateGroup,
      ...flatEntityUpdate,
    };

    if (
      updatedPredicateGroup.roleUniversalIdentifier !==
        existingPredicateGroup.roleUniversalIdentifier ||
      updatedPredicateGroup.sharingRuleUniversalIdentifier !==
        existingPredicateGroup.sharingRuleUniversalIdentifier
    ) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.UNAUTHORIZED_ROLE_MODIFICATION,
        message: t`Cannot modify predicate group to change the role or sharing rule it belongs to`,
        userFriendlyMessage: msg`Cannot modify predicate group to change its role or sharing rule`,
      });
    }

    if (
      updatedPredicateGroup.objectMetadataUniversalIdentifier !==
      existingPredicateGroup.objectMetadataUniversalIdentifier
    ) {
      const existingObjectMetadataIdentifier =
        existingPredicateGroup.objectMetadataUniversalIdentifier;
      const updatedObjectMetadataIdentifier =
        updatedPredicateGroup.objectMetadataUniversalIdentifier;

      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.UNAUTHORIZED_OBJECT_MODIFICATION,
        message: t`Cannot modify predicate group to change its object from ${existingObjectMetadataIdentifier} to ${updatedObjectMetadataIdentifier}`,
        userFriendlyMessage: msg`Cannot modify predicate group to change its object`,
      });
    }

    if (
      isDefined(
        updatedPredicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      )
    ) {
      const parentGroup = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedPredicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
        flatEntityMaps: optimisticFlatPredicateGroupMaps,
      });

      if (!isDefined(parentGroup)) {
        validationResult.errors.push({
          code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
          message: t`Parent row level permission predicate group not found`,
          userFriendlyMessage: msg`Parent row level permission predicate group not found`,
        });
      } else if (
        parentGroup.roleUniversalIdentifier !==
          updatedPredicateGroup.roleUniversalIdentifier ||
        parentGroup.sharingRuleUniversalIdentifier !==
          updatedPredicateGroup.sharingRuleUniversalIdentifier
      ) {
        validationResult.errors.push(this.getParentGroupMismatchError());
      }
    }

    validationResult.errors.push(
      ...this.getParentErrors({
        predicateGroup: updatedPredicateGroup,
        flatRoleMaps,
        flatSharingRuleMaps,
      }),
    );

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            updatedPredicateGroup.objectMetadataUniversalIdentifier,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    return validationResult;
  }

  private getParentGroupMismatchError() {
    return {
      code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
      message: t`Row level permission predicate group must belong to the same role or sharing rule as its parent group`,
      userFriendlyMessage: msg`Predicate group and its parent group must belong to the same role or sharing rule`,
    };
  }

  private getParentErrors({
    predicateGroup,
    flatRoleMaps,
    flatSharingRuleMaps,
  }: {
    predicateGroup: Pick<
      UniversalFlatRowLevelPermissionPredicateGroup,
      'roleUniversalIdentifier' | 'sharingRuleUniversalIdentifier'
    >;
    flatRoleMaps: AllUniversalFlatEntityMaps['flatRoleMaps'] | undefined;
    flatSharingRuleMaps:
      | AllUniversalFlatEntityMaps['flatSharingRuleMaps']
      | undefined;
  }) {
    const { roleUniversalIdentifier, sharingRuleUniversalIdentifier } =
      predicateGroup;

    if (
      isDefined(roleUniversalIdentifier) ===
      isDefined(sharingRuleUniversalIdentifier)
    ) {
      return [
        {
          code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
          message: t`Row level permission predicate group must belong to exactly one role or sharing rule`,
          userFriendlyMessage: msg`Predicate group must belong to exactly one role or sharing rule`,
        },
      ];
    }

    if (isDefined(roleUniversalIdentifier)) {
      const role = flatRoleMaps
        ? findFlatEntityByUniversalIdentifier({
            universalIdentifier: roleUniversalIdentifier,
            flatEntityMaps: flatRoleMaps,
          })
        : undefined;

      return isDefined(role)
        ? []
        : [
            {
              code: RowLevelPermissionPredicateGroupExceptionCode.ROLE_NOT_FOUND,
              message: t`Role not found`,
              userFriendlyMessage: msg`Role not found`,
            },
          ];
    }

    const sharingRule =
      flatSharingRuleMaps && isDefined(sharingRuleUniversalIdentifier)
        ? findFlatEntityByUniversalIdentifier({
            universalIdentifier: sharingRuleUniversalIdentifier,
            flatEntityMaps: flatSharingRuleMaps,
          })
        : undefined;

    return isDefined(sharingRule)
      ? []
      : [
          {
            code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
            message: t`Sharing rule not found`,
            userFriendlyMessage: msg`Sharing rule not found`,
          },
        ];
  }
}
