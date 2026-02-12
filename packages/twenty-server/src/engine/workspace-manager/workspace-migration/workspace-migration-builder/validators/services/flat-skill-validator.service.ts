import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateSkillNameUniqueness } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-skill-name-uniqueness.util';
import {
  validateSkillContentIsDefined,
  validateSkillLabelIsDefined,
  validateSkillRequiredProperties,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-skill-required-properties.util';

@Injectable()
export class FlatSkillValidatorService {
  public validateFlatSkillCreation({
    flatEntityToValidate: flatSkill,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSkillMaps: optimisticFlatSkillMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<'skill', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatSkill.universalIdentifier,
        name: flatSkill.name,
      },
      metadataName: 'skill',
      type: 'create',
    });

    const existingSkills = Object.values(
      optimisticFlatSkillMaps.byUniversalIdentifier,
    ).filter(isDefined);

    validationResult.errors.push(
      ...validateSkillRequiredProperties({ flatSkill }),
    );

    validationResult.errors.push(
      ...validateSkillNameUniqueness({
        name: flatSkill.name,
        existingFlatSkills: existingSkills,
      }),
    );

    return validationResult;
  }

  public validateFlatSkillDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSkillMaps: optimisticFlatSkillMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<'skill', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'skill',
      type: 'delete',
    });

    const existingSkill = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatSkillMaps,
    });

    if (!isDefined(existingSkill)) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_NOT_FOUND,
        message: t`Skill not found`,
        userFriendlyMessage: msg`Skill not found`,
      });

      return validationResult;
    }

    if (
      !buildOptions.isSystemBuild &&
      belongsToTwentyStandardApp({
        universalIdentifier: existingSkill.universalIdentifier,
        applicationUniversalIdentifier:
          existingSkill.applicationUniversalIdentifier,
      })
    ) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_IS_STANDARD,
        message: t`Cannot delete standard skill`,
        userFriendlyMessage: msg`Cannot delete standard skill`,
      });
    }

    return validationResult;
  }

  public validateFlatSkillUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSkillMaps: optimisticFlatSkillMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<'skill', 'update'> {
    const fromFlatSkill = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatSkillMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'skill',
      type: 'update',
    });

    if (!isDefined(fromFlatSkill)) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_NOT_FOUND,
        message: t`Skill not found`,
        userFriendlyMessage: msg`Skill not found`,
      });

      return validationResult;
    }

    const isActiveUpdate = flatEntityUpdate.isActive;

    const hasNonIsActiveUpdates = Object.keys(flatEntityUpdate).some(
      (key) => key !== 'isActive',
    );

    const isTwentyStandardSkill = belongsToTwentyStandardApp({
      universalIdentifier: fromFlatSkill.universalIdentifier,
      applicationUniversalIdentifier:
        fromFlatSkill.applicationUniversalIdentifier,
    });

    if (
      !buildOptions.isSystemBuild &&
      isTwentyStandardSkill &&
      hasNonIsActiveUpdates
    ) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_IS_STANDARD,
        message: t`Cannot update standard skill properties (only activation/deactivation allowed)`,
        userFriendlyMessage: msg`Cannot update standard skill properties (only activation/deactivation allowed)`,
      });
    }

    // If only isActive is being updated on a standard skill, allow it
    if (
      isTwentyStandardSkill &&
      isDefined(isActiveUpdate) &&
      !hasNonIsActiveUpdates
    ) {
      return validationResult;
    }

    const optimisticFlatSkill: UniversalFlatSkill = {
      ...fromFlatSkill,
      ...flatEntityUpdate,
    };

    const labelUpdate = flatEntityUpdate.label;

    if (isDefined(labelUpdate)) {
      validationResult.errors.push(
        ...validateSkillLabelIsDefined({ flatSkill: optimisticFlatSkill }),
      );
    }

    const contentUpdate = flatEntityUpdate.content;

    if (isDefined(contentUpdate)) {
      validationResult.errors.push(
        ...validateSkillContentIsDefined({ flatSkill: optimisticFlatSkill }),
      );
    }

    const nameUpdate = flatEntityUpdate.name;

    if (isDefined(nameUpdate)) {
      const existingSkills = Object.values(
        optimisticFlatSkillMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((skill) => skill.universalIdentifier !== universalIdentifier);

      validationResult.errors.push(
        ...validateSkillNameUniqueness({
          name: nameUpdate,
          existingFlatSkills: existingSkills,
        }),
      );
    }

    return validationResult;
  }
}
