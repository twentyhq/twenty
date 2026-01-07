import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';

export const fromSkillEntityToFlatSkill = (
  skillEntity: SkillEntity,
): FlatSkill => {
  return {
    createdAt: skillEntity.createdAt.toISOString(),
    updatedAt: skillEntity.updatedAt.toISOString(),
    id: skillEntity.id,
    standardId: skillEntity.standardId,
    name: skillEntity.name,
    label: skillEntity.label,
    icon: skillEntity.icon,
    description: skillEntity.description,
    content: skillEntity.content,
    workspaceId: skillEntity.workspaceId,
    isCustom: skillEntity.isCustom,
    isActive: skillEntity.isActive,
    universalIdentifier: skillEntity.standardId || skillEntity.id,
    applicationId: skillEntity.applicationId,
  };
};
