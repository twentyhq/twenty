import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';

export const fromDeleteSkillInputToFlatSkillOrThrow = ({
  flatSkillMaps,
  skillId,
}: {
  flatSkillMaps: FlatEntityMaps<FlatSkill>;
  skillId: string;
}): FlatSkill => {
  const existingFlatSkill = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: skillId,
    flatEntityMaps: flatSkillMaps,
  });

  if (!isDefined(existingFlatSkill)) {
    throw new SkillException(
      'Skill not found',
      SkillExceptionCode.SKILL_NOT_FOUND,
    );
  }

  if (!existingFlatSkill.isCustom) {
    throw new SkillException(
      'Cannot delete standard skill',
      SkillExceptionCode.SKILL_IS_STANDARD,
    );
  }

  return existingFlatSkill;
};
