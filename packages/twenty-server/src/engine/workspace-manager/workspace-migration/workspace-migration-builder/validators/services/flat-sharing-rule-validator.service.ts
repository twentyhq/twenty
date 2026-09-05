import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { SHARING_RULE_ACCESS_LEVELS } from 'src/engine/metadata-modules/sharing-rule/constants/sharing-rule-access-levels.constant';
import { SharingRuleExceptionCode } from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';
import { type UniversalFlatSharingRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-sharing-rule.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type SharingRuleValidationMaps =
  MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'sharingRule'>;

type SharingRuleValidationResult = FailedFlatEntityValidation<
  'sharingRule',
  'create' | 'update'
>;

@Injectable()
export class FlatSharingRuleValidatorService {
  public validateFlatSharingRuleCreation({
    flatEntityToValidate: flatSharingRule,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: validationMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.sharingRule
  >): FailedFlatEntityValidation<'sharingRule', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatSharingRule.universalIdentifier,
        name: flatSharingRule.name,
      },
      metadataName: 'sharingRule',
      type: 'create',
    });

    const existingSharingRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatSharingRule.universalIdentifier,
      flatEntityMaps: validationMaps.flatSharingRuleMaps,
    });

    if (isDefined(existingSharingRule)) {
      validationResult.errors.push({
        code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
        message: t`Sharing rule with this universal identifier already exists`,
        userFriendlyMessage: msg`Sharing rule already exists`,
      });
    }

    this.validateSharingRuleConfiguration({
      sharingRule: flatSharingRule,
      validationMaps,
      validationResult,
    });

    return validationResult;
  }

  public validateFlatSharingRuleDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSharingRuleMaps: optimisticFlatSharingRuleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.sharingRule
  >): FailedFlatEntityValidation<'sharingRule', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'sharingRule',
      type: 'delete',
    });

    const existingSharingRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatSharingRuleMaps,
    });

    if (!isDefined(existingSharingRule)) {
      validationResult.errors.push({
        code: SharingRuleExceptionCode.SHARING_RULE_NOT_FOUND,
        message: t`Sharing rule not found`,
        userFriendlyMessage: msg`Sharing rule not found`,
      });
    }

    return validationResult;
  }

  public validateFlatSharingRuleUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.sharingRule
  >): FailedFlatEntityValidation<'sharingRule', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'sharingRule',
      type: 'update',
    });

    const fromFlatSharingRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatSharingRuleMaps,
    });

    if (!isDefined(fromFlatSharingRule)) {
      validationResult.errors.push({
        code: SharingRuleExceptionCode.SHARING_RULE_NOT_FOUND,
        message: t`Sharing rule not found`,
        userFriendlyMessage: msg`Sharing rule not found`,
      });

      return validationResult;
    }

    this.validateSharingRuleConfiguration({
      sharingRule: {
        ...fromFlatSharingRule,
        ...flatEntityUpdate,
      },
      validationMaps: optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      validationResult,
    });

    return validationResult;
  }

  private validateSharingRuleConfiguration({
    sharingRule,
    validationMaps,
    validationResult,
  }: {
    sharingRule: UniversalFlatSharingRule;
    validationMaps: SharingRuleValidationMaps;
    validationResult: SharingRuleValidationResult;
  }): void {
    if (!isNonEmptyString(sharingRule.name)) {
      validationResult.errors.push({
        code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
        message: t`Sharing rule name is required`,
        userFriendlyMessage: msg`Sharing rule name is required`,
      });
    }

    const objectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: sharingRule.objectMetadataUniversalIdentifier,
      flatEntityMaps: validationMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: SharingRuleExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Sharing rule references an object that does not exist`,
        userFriendlyMessage: msg`The object used by this sharing rule is not available`,
      });
    }

    if (!SHARING_RULE_ACCESS_LEVELS.includes(sharingRule.accessLevel)) {
      validationResult.errors.push({
        code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
        message: t`Sharing rule access level must be READ or READ_WRITE`,
        userFriendlyMessage: msg`A sharing rule can only grant read or read and write access`,
      });
    }

    this.validateSharingRuleGrantee({
      sharingRule,
      validationMaps,
      validationResult,
    });
  }

  private validateSharingRuleGrantee({
    sharingRule,
    validationMaps,
    validationResult,
  }: {
    sharingRule: UniversalFlatSharingRule;
    validationMaps: SharingRuleValidationMaps;
    validationResult: SharingRuleValidationResult;
  }): void {
    const { granteePrincipalType, granteePrincipalId } = sharingRule;
    const granteeRoleUniversalIdentifier =
      sharingRule.granteeRoleUniversalIdentifier;

    switch (granteePrincipalType) {
      case RecordSharePrincipalType.EVERYONE: {
        if (
          isDefined(granteePrincipalId) ||
          isDefined(granteeRoleUniversalIdentifier)
        ) {
          validationResult.errors.push({
            code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
            message: t`A sharing rule granting everyone must not name a grantee`,
            userFriendlyMessage: msg`A sharing rule granting everyone must not name a grantee`,
          });
        }

        return;
      }
      case RecordSharePrincipalType.WORKSPACE_MEMBER: {
        if (
          !isDefined(granteePrincipalId) ||
          isDefined(granteeRoleUniversalIdentifier)
        ) {
          validationResult.errors.push({
            code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
            message: t`A sharing rule granting a workspace member must name that member and no role`,
            userFriendlyMessage: msg`Choose the workspace member this sharing rule grants access to`,
          });
        }

        return;
      }
      case RecordSharePrincipalType.ROLE: {
        if (
          isDefined(granteePrincipalId) ||
          !isDefined(granteeRoleUniversalIdentifier)
        ) {
          validationResult.errors.push({
            code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
            message: t`A sharing rule granting a role must name that role and no workspace member`,
            userFriendlyMessage: msg`Choose the role this sharing rule grants access to`,
          });

          return;
        }

        const granteeRole = findFlatEntityByUniversalIdentifier({
          universalIdentifier: granteeRoleUniversalIdentifier,
          flatEntityMaps: validationMaps.flatRoleMaps,
        });

        if (!isDefined(granteeRole)) {
          validationResult.errors.push({
            code: SharingRuleExceptionCode.ROLE_NOT_FOUND,
            message: t`Sharing rule references a role that does not exist`,
            userFriendlyMessage: msg`The role used by this sharing rule is not available`,
          });
        }

        return;
      }
      default: {
        validationResult.errors.push({
          code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
          message: t`Unknown sharing rule grantee principal type ${granteePrincipalType}`,
          userFriendlyMessage: msg`This sharing rule grantee type is not supported`,
        });
      }
    }
  }
}
