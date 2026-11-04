import { isDefined } from 'twenty-shared/utils';

import { type FlatSkillMaps } from 'src/engine/metadata-modules/flat-skill/types/flat-skill-maps.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const findActiveEffectiveFlatSkills = (
  flatSkillMaps: FlatSkillMaps,
): FlatSkill[] =>
  Object.values(flatSkillMaps.byUniversalIdentifier)
    .filter(isDefined)
    .map((flatSkill) =>
      resolveEffectiveFlatEntity({
        metadataName: 'skill',
        flatEntity: flatSkill,
      }),
    )
    .filter((flatSkill) => flatSkill.isActive);
