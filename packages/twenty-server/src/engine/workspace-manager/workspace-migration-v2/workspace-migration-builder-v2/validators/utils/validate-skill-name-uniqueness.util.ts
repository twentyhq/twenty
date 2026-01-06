import { msg, t } from '@lingui/core/macro';

import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateSkillNameUniqueness = ({
  name,
  existingFlatSkills,
}: {
  name: string;
  existingFlatSkills: FlatSkill[];
}): FlatEntityValidationError<SkillExceptionCode>[] => {
  const errors: FlatEntityValidationError<SkillExceptionCode>[] = [];

  if (existingFlatSkills.some((skill) => skill.name === name)) {
    errors.push({
      code: SkillExceptionCode.SKILL_ALREADY_EXISTS,
      message: t`Skill with name "${name}" already exists`,
      userFriendlyMessage: msg`A skill with this name already exists`,
    });
  }

  return errors;
};
