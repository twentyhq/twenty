import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_SKILL_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-skill/constants/flat-skill-editable-properties.constant';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateSkillInputToFlatSkillToUpdateOrThrow = ({
  flatSkillMaps,
  updateSkillInput,
}: {
  flatSkillMaps: FlatEntityMaps<FlatSkill>;
  updateSkillInput: UpdateSkillInput;
}): FlatSkill => {
  const existingFlatSkill = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: updateSkillInput.id,
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
      'Cannot update standard skill',
      SkillExceptionCode.SKILL_IS_STANDARD,
    );
  }

  const { id: _id, ...updates } = updateSkillInput;

  return {
    ...mergeUpdateInExistingRecord({
      existing: existingFlatSkill,
      properties: [...FLAT_SKILL_EDITABLE_PROPERTIES],
      update: updates,
    }),
    updatedAt: new Date().toISOString(),
  };
};
