import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type ValidateSkillRequiredPropertiesArgs = {
  flatSkill: FlatSkill;
  updatedProperties?: Partial<FlatSkill>;
};

export const validateSkillRequiredProperties = ({
  flatSkill,
  updatedProperties,
}: ValidateSkillRequiredPropertiesArgs): FlatEntityValidationError<SkillExceptionCode>[] => {
  const errors: FlatEntityValidationError<SkillExceptionCode>[] = [];

  // For updates, only validate properties that are being changed
  const isUpdate = updatedProperties !== undefined;
  const shouldValidateLabel = !isUpdate || 'label' in updatedProperties;
  const shouldValidateContent = !isUpdate || 'content' in updatedProperties;

  if (shouldValidateLabel && !isNonEmptyString(flatSkill.label)) {
    errors.push({
      code: SkillExceptionCode.INVALID_SKILL_INPUT,
      message: t`Label cannot be empty`,
      userFriendlyMessage: msg`Label cannot be empty`,
    });
  }

  if (shouldValidateContent && !isNonEmptyString(flatSkill.content)) {
    errors.push({
      code: SkillExceptionCode.INVALID_SKILL_INPUT,
      message: t`Content cannot be empty`,
      userFriendlyMessage: msg`Content cannot be empty`,
    });
  }

  return errors;
};
