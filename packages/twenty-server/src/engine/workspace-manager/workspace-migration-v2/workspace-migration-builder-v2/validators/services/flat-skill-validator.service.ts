import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { validateSkillNameUniqueness } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-skill-name-uniqueness.util';
import { validateSkillRequiredProperties } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-skill-required-properties.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatSkillValidatorService {
  public validateFlatSkillCreation({
    flatEntityToValidate: flatSkill,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSkillMaps: optimisticFlatSkillMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<FlatSkill> {
    const validationResult: FailedFlatEntityValidation<FlatSkill> = {
      type: 'create_skill',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatSkill.id,
        name: flatSkill.name,
      },
    };

    const existingSkills = Object.values(optimisticFlatSkillMaps.byId).filter(
      isDefined,
    );

    validationResult.errors.push(
      ...validateSkillRequiredProperties({
        flatSkill,
      }),
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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<FlatSkill> {
    const validationResult: FailedFlatEntityValidation<FlatSkill> = {
      type: 'delete_skill',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        name: flatEntityToValidate.name,
      },
    };

    const existingSkill = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
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

    if (!buildOptions.isSystemBuild && isStandardMetadata(existingSkill)) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_IS_STANDARD,
        message: t`Cannot delete standard skill`,
        userFriendlyMessage: msg`Cannot delete standard skill`,
      });
    }

    return validationResult;
  }

  public validateFlatSkillUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSkillMaps: optimisticFlatSkillMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<FlatSkill> {
    const validationResult: FailedFlatEntityValidation<FlatSkill> = {
      type: 'update_skill',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const fromFlatSkill = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatSkillMaps,
    });

    if (!isDefined(fromFlatSkill)) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_NOT_FOUND,
        message: t`Skill not found`,
        userFriendlyMessage: msg`Skill not found`,
      });

      return validationResult;
    }

    if (!buildOptions.isSystemBuild && isStandardMetadata(fromFlatSkill)) {
      validationResult.errors.push({
        code: SkillExceptionCode.SKILL_IS_STANDARD,
        message: t`Cannot update standard skill`,
        userFriendlyMessage: msg`Cannot update standard skill`,
      });
    }

    const partialFlatSkill: Partial<FlatSkill> =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      });

    const optimisticFlatSkill: FlatSkill = {
      ...fromFlatSkill,
      ...partialFlatSkill,
    };

    const existingSkills = Object.values(optimisticFlatSkillMaps.byId)
      .filter(isDefined)
      .filter((skill) => skill.id !== flatEntityId);

    validationResult.errors.push(
      ...validateSkillRequiredProperties({
        flatSkill: optimisticFlatSkill,
        updatedProperties: partialFlatSkill,
      }),
    );

    if (isDefined(partialFlatSkill.name)) {
      validationResult.errors.push(
        ...validateSkillNameUniqueness({
          name: partialFlatSkill.name,
          existingFlatSkills: existingSkills,
        }),
      );
    }

    return validationResult;
  }
}
