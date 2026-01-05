import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateSkillLabelIsDefined = ({
  flatSkill,
}: {
  flatSkill: FlatSkill;
}): FlatEntityValidationError<SkillExceptionCode>[] => {
  if (isNonEmptyString(flatSkill.label)) {
    return [];
  }

  return [
    {
      code: SkillExceptionCode.INVALID_SKILL_INPUT,
      message: t`Label cannot be empty`,
      userFriendlyMessage: msg`Label cannot be empty`,
    },
  ];
};

export const validateSkillContentIsDefined = ({
  flatSkill,
}: {
  flatSkill: FlatSkill;
}): FlatEntityValidationError<SkillExceptionCode>[] => {
  if (isNonEmptyString(flatSkill.content)) {
    return [];
  }

  return [
    {
      code: SkillExceptionCode.INVALID_SKILL_INPUT,
      message: t`Content cannot be empty`,
      userFriendlyMessage: msg`Content cannot be empty`,
    },
  ];
};

export const validateSkillRequiredProperties = ({
  flatSkill,
}: {
  flatSkill: FlatSkill;
}): FlatEntityValidationError<SkillExceptionCode>[] => [
  ...validateSkillLabelIsDefined({ flatSkill }),
  ...validateSkillContentIsDefined({ flatSkill }),
];
