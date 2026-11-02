import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';

export const fromFlatSkillToSkillDto = (flatSkill: FlatSkill): SkillDTO => {
  const effectiveFlatSkill = resolveEffectiveFlatEntity({
    metadataName: 'skill',
    flatEntity: flatSkill,
  });

  return {
    id: effectiveFlatSkill.id,
    name: effectiveFlatSkill.name,
    label: effectiveFlatSkill.label,
    icon: effectiveFlatSkill.icon ?? undefined,
    description: effectiveFlatSkill.description ?? undefined,
    content: effectiveFlatSkill.content,
    isSystem: effectiveFlatSkill.isSystem,
    isActive: effectiveFlatSkill.isActive,
    workspaceId: effectiveFlatSkill.workspaceId,
    applicationId: effectiveFlatSkill.applicationId ?? undefined,
    createdAt: new Date(effectiveFlatSkill.createdAt),
    updatedAt: new Date(effectiveFlatSkill.updatedAt),
  };
};
