import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_LOCAL_STATE_PROPERTIES } from 'src/engine/metadata-modules/overrides/constants/workspace-local-state-properties.constant';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
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
      !isCallerTwentyStandardApp(buildOptions) &&
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

    const isWorkspaceLocalStateUpdate = Object.keys(flatEntityUpdate).every(
      (key) => WORKSPACE_LOCAL_STATE_PROPERTIES.has(key),
    );

    const isTwentyStandardSkill = belongsToTwentyStandardApp({
      universalIdentifier: fromFlatSkill.universalIdentifier,
      applicationUniversalIdentifier:
        fromFlatSkill.applicationUniversalIdentifier,
    });

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      isTwentyStandardSkill &&
      !isWorkspaceLocalStateUpdate
    ) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_IS_STANDARD,
        message: t`Cannot update standard skill properties (only overrides and activation/deactivation allowed)`,
        userFriendlyMessage: msg`Cannot update standard skill properties (only overrides and activation/deactivation allowed)`,
      });
    }

    const optimisticFlatSkill = { ...fromFlatSkill, ...flatEntityUpdate };

    if (isDefined(flatEntityUpdate.label)) {
      validationResult.errors.push(
        ...validateSkillLabelIsDefined({ flatSkill: optimisticFlatSkill }),
      );
    }

    if (isDefined(flatEntityUpdate.content)) {
      validationResult.errors.push(
        ...validateSkillContentIsDefined({ flatSkill: optimisticFlatSkill }),
      );
    }

    if (isDefined(flatEntityUpdate.overrides)) {
      validationResult.errors.push(
        ...validateSkillRequiredProperties({
          flatSkill: resolveEffectiveFlatEntity({
            metadataName: 'skill',
            flatEntity: optimisticFlatSkill,
          }),
        }),
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
