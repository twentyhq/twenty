import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateSkillLabelIsDefined = ({
  flatSkill,
}: {
  flatSkill: UniversalFlatSkill;
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
  flatSkill: UniversalFlatSkill;
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
  flatSkill: UniversalFlatSkill;
}): FlatEntityValidationError<SkillExceptionCode>[] => [
  ...validateSkillLabelIsDefined({ flatSkill }),
  ...validateSkillContentIsDefined({ flatSkill }),
];
