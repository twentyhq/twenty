import { msg, t } from '@lingui/core/macro';

import { SkillExceptionCode } from 'src/engine/metadata-modules/skill/skill.exception';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateSkillNameUniqueness = ({
  name,
  existingFlatSkills,
}: {
  name: string;
  existingFlatSkills: UniversalFlatSkill[];
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
