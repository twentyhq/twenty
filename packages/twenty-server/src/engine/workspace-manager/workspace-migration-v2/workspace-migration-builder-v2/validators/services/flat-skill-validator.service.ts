import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { validateSkillNameUniqueness } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-skill-name-uniqueness.util';
import {
  validateSkillContentIsDefined,
  validateSkillLabelIsDefined,
  validateSkillRequiredProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-skill-required-properties.util';
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
      type: 'create',
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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.skill
  >): FailedFlatEntityValidation<FlatSkill> {
    const validationResult: FailedFlatEntityValidation<FlatSkill> = {
      type: 'delete',
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
      type: 'update',
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

    // Standard skills can only have isActive toggled, not other properties
    const isActiveUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'isActive',
    });

    const hasNonIsActiveUpdates = flatEntityUpdates.some(
      (update) => update.property !== 'isActive',
    );

    if (
      !buildOptions.isSystemBuild &&
      isStandardMetadata(fromFlatSkill) &&
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
      isStandardMetadata(fromFlatSkill) &&
      isDefined(isActiveUpdate) &&
      !hasNonIsActiveUpdates
    ) {
      return validationResult;
    }

    const optimisticFlatSkill: FlatSkill = {
      ...fromFlatSkill,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const labelUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'label',
    });

    if (isDefined(labelUpdate)) {
      validationResult.errors.push(
        ...validateSkillLabelIsDefined({ flatSkill: optimisticFlatSkill }),
      );
    }

    const contentUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'content',
    });

    if (isDefined(contentUpdate)) {
      validationResult.errors.push(
        ...validateSkillContentIsDefined({ flatSkill: optimisticFlatSkill }),
      );
    }

    const nameUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'name',
    });

    if (isDefined(nameUpdate)) {
      const existingSkills = Object.values(optimisticFlatSkillMaps.byId)
        .filter(isDefined)
        .filter((skill) => skill.id !== flatEntityId);

      validationResult.errors.push(
        ...validateSkillNameUniqueness({
          name: nameUpdate.to,
          existingFlatSkills: existingSkills,
        }),
      );
    }

    return validationResult;
  }
}
